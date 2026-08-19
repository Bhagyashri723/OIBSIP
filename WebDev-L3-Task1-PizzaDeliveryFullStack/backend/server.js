const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ================================
   RAZORPAY
================================ */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================================
   EMAIL
================================ */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email credentials not configured.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"PizzaHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent to:", to);
    return true;
  } catch (error) {
    console.log("Email error:", error.message);
    return false;
  }
}

/* ================================
   DATABASE
================================ */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.log("MongoDB error:", e.message));

/* ================================
   USER MODEL
================================ */

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: String,

      email: {
        type: String,
        unique: true,
      },

      password: String,

      role: {
        type: String,
        default: "user",
      },

      emailVerified: {
        type: Boolean,
        default: false,
      },

      verificationToken: String,

      resetToken: String,

      resetTokenExpiry: Date,
    },
    {
      timestamps: true,
    }
  )
);

/* ================================
   ORDER MODEL
================================ */

const Order = mongoose.model(
  "Order",
  new mongoose.Schema(
    {
      userId: mongoose.Schema.Types.ObjectId,

      items: Array,

      total: Number,

      status: {
        type: String,
        default: "Order Received",
      },

      paymentStatus: {
        type: String,
        default: "Pending",
      },

      paymentId: String,

      razorpayOrderId: String,
    },
    {
      timestamps: true,
    }
  )
);

/* ================================
   INVENTORY MODEL
================================ */

const Inventory = mongoose.model(
  "Inventory",
  new mongoose.Schema(
    {
      name: {
        type: String,
        unique: true,
      },

      category: String,

      stock: Number,

      threshold: {
        type: Number,
        default: 20,
      },

      lastNotifiedAt: Date,
    },
    {
      timestamps: true,
    }
  )
);

/* ================================
   PRODUCTS
================================ */

const products = [
  {
    name: "Margherita Classic",
    price: 299,
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    desc: "Tomato, mozzarella and basil",
  },

  {
    name: "Farmhouse",
    price: 399,
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    desc: "Capsicum, onion, corn and mushrooms",
  },

  {
    name: "Pepperoni Feast",
    price: 449,
    img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
    desc: "Cheese-loaded pepperoni",
  },

  {
    name: "Veggie Delight",
    price: 379,
    img: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800",
    desc: "Fresh vegetables and mozzarella",
  },
];

/* ================================
   AUTH MIDDLEWARE
================================ */

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        message: "Login required",
      });
    }

    const token = header.split(" ")[1];

    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();
  } catch (e) {
    res.status(401).json({
      message: "Login required",
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      message: "Admin only",
    });
  }
};

/* ================================
   HEALTH
================================ */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
  });
});

/* ================================
   PRODUCTS
================================ */

app.get("/api/products", (req, res) => {
  res.json(products);
});

/* ================================
   REGISTER
================================ */

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const verificationToken =
      crypto.randomBytes(32).toString("hex");

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      emailVerified: false,
    });

    const verificationLink =
      `${process.env.FRONTEND_URL}/?verify=${verificationToken}`;

    await sendEmail(
      email,
      "Verify your PizzaHub account",
      `
        <div style="font-family:Arial;padding:30px">
          <h1 style="color:#e64d24">🍕 PizzaHub</h1>
          <h2>Welcome ${name}!</h2>
          <p>Please verify your email address to activate your account.</p>
          <a href="${verificationLink}"
             style="
               display:inline-block;
               padding:12px 20px;
               background:#e64d24;
               color:white;
               text-decoration:none;
               border-radius:8px;
             ">
             Verify Email
          </a>
          <p>If you did not create this account, ignore this email.</p>
        </div>
      `
    );

   res.json({
  message:
    "Registration successful. You can login now.",
});
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* ================================
   VERIFY EMAIL
================================ */

app.get(
  "/api/verify-email/:token",
  async (req, res) => {
    try {
      const user = await User.findOne({
        verificationToken: req.params.token,
      });

      if (!user) {
        return res.status(400).json({
          message: "Invalid or expired verification link",
        });
      }

      user.emailVerified = true;
      user.verificationToken = undefined;

      await user.save();

      res.json({
        message: "Email verified successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   LOGIN
================================ */

app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (
      !user ||
      !(await bcrypt.compare(
        req.body.password,
        user.password
      ))
    ) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /*
      Existing users created before email verification
      functionality are allowed to continue.
    */

 

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,

      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* ================================
   FORGOT PASSWORD
================================ */

app.post(
  "/api/forgot-password",
  async (req, res) => {
    try {
      const user = await User.findOne({
        email: req.body.email,
      });

      /*
        Do not reveal whether email exists.
      */

      if (!user) {
        return res.json({
          message:
            "If the email exists, a reset link has been sent.",
        });
      }

      const resetToken =
        crypto.randomBytes(32).toString("hex");

      user.resetToken = resetToken;

      user.resetTokenExpiry =
        Date.now() + 30 * 60 * 1000;

      await user.save();

      const resetLink =
        `${process.env.FRONTEND_URL}/?reset=${resetToken}`;

      await sendEmail(
        user.email,
        "Reset your PizzaHub password",
        `
          <div style="font-family:Arial;padding:30px">
            <h1 style="color:#e64d24">🍕 PizzaHub</h1>
            <h2>Password Reset</h2>

            <p>Hello ${user.name},</p>

            <p>
              Click the button below to reset your password.
              This link expires in 30 minutes.
            </p>

            <a href="${resetLink}"
               style="
                 display:inline-block;
                 padding:12px 20px;
                 background:#e64d24;
                 color:white;
                 text-decoration:none;
                 border-radius:8px;
               ">
              Reset Password
            </a>
          </div>
        `
      );

      res.json({
        message:
          "If the email exists, a reset link has been sent.",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   RESET PASSWORD
================================ */

app.post(
  "/api/reset-password",
  async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          message: "Token and password are required",
        });
      }

      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: {
          $gt: new Date(),
        },
      });

      if (!user) {
        return res.status(400).json({
          message:
            "Invalid or expired reset link",
        });
      }

      user.password = await bcrypt.hash(
        password,
        10
      );

      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;

      await user.save();

      res.json({
        message:
          "Password reset successfully. You can now login.",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   CREATE ADMIN
================================ */

app.post("/api/admin/reset-direct", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "This account is not an admin",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({
      message: "Admin password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* ================================
   USER ORDERS
================================ */

app.get(
  "/api/orders/my",
  auth,
  async (req, res) => {
    try {
      const orders = await Order.find({
        userId: req.user.id,
      }).sort({
        createdAt: -1,
      });

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   RAZORPAY CREATE ORDER
================================ */

app.post(
  "/api/payment/create-order",
  auth,
  async (req, res) => {
    try {
      const amount = Number(req.body.amount);

      if (!amount || amount <= 0) {
        return res.status(400).json({
          message: "Invalid amount",
        });
      }

      const order =
        await razorpay.orders.create({
          amount: Math.round(amount * 100),
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        });

      res.json({
        ...order,
        key_id:
          process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.log(
        "Razorpay error:",
        error.message
      );

      res.status(500).json({
        message:
          "Payment order creation failed",
      });
    }
  }
);

/* ================================
   CREATE ORDER + VERIFY PAYMENT
================================ */

app.post(
  "/api/orders",
  auth,
  async (req, res) => {
    try {
      const {
        items,
        total,
        paymentId,
        razorpayOrderId,
        signature,
      } = req.body;

      if (
        !paymentId ||
        !razorpayOrderId ||
        !signature
      ) {
        return res.status(400).json({
          message:
            "Payment verification details missing",
        });
      }

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            razorpayOrderId +
              "|" +
              paymentId
          )
          .digest("hex");

      if (
        generatedSignature !== signature
      ) {
        return res.status(400).json({
          message:
            "Payment verification failed",
        });
      }

      const order = await Order.create({
        userId: req.user.id,
        items,
        total,
        paymentStatus: "Success",
        paymentId,
        razorpayOrderId,
      });

      /*
        Decrement inventory for custom pizza
      */

      for (const item of items || []) {
        const ingredients = [
          item.base,
          item.sauce,
          item.cheese,
          ...(item.vegetables || []),
        ];

        for (const ingredient of ingredients) {
          if (ingredient) {
            await Inventory.updateOne(
              {
                name: ingredient,
              },
              {
                $inc: {
                  stock: -1,
                },
              }
            );
          }
        }
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   ADMIN ORDERS
================================ */

app.get(
  "/api/orders",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({
          createdAt: -1,
        });

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   ADMIN STATUS UPDATE
================================ */

app.patch(
  "/api/orders/:id/status",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const allowedStatuses = [
        "Order Received",
        "In Kitchen",
        "Sent to Delivery",
        "Delivered",
      ];

      if (
        !allowedStatuses.includes(
          req.body.status
        )
      ) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            status: req.body.status,
          },
          {
            new: true,
          }
        );

      res.json(order);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   INVENTORY
================================ */

app.get(
  "/api/inventory",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const inventory =
        await Inventory.find().sort({
          category: 1,
          name: 1,
        });

      res.json(inventory);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   SEED INVENTORY
================================ */

app.post(
  "/api/inventory/seed",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const items = [
        ["Classic Base", "base"],
        ["Thin Crust", "base"],
        ["Cheese Burst", "base"],
        ["Whole Wheat", "base"],
        ["Italian Base", "base"],

        ["Tomato Sauce", "sauce"],
        ["Pesto Sauce", "sauce"],
        ["BBQ Sauce", "sauce"],
        ["Garlic Sauce", "sauce"],
        ["Spicy Sauce", "sauce"],

        ["Mozzarella", "cheese"],
        ["Cheddar", "cheese"],
        ["Parmesan", "cheese"],
        ["Gouda", "cheese"],
        ["Vegan Cheese", "cheese"],

        ["Capsicum", "vegetable"],
        ["Onion", "vegetable"],
        ["Corn", "vegetable"],
        ["Olives", "vegetable"],
        ["Mushroom", "vegetable"],
      ];

      for (const item of items) {
        await Inventory.updateOne(
          {
            name: item[0],
          },
          {
            name: item[0],
            category: item[1],
            stock: 50,
            threshold: 20,
          },
          {
            upsert: true,
          }
        );
      }

      res.json({
        message: "Inventory seeded",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   MANUAL STOCK UPDATE
================================ */

app.patch(
  "/api/inventory/:id",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const stock = Number(
        req.body.stock
      );

      const threshold =
        req.body.threshold !== undefined
          ? Number(req.body.threshold)
          : undefined;

      if (
        Number.isNaN(stock) ||
        stock < 0
      ) {
        return res.status(400).json({
          message:
            "Stock must be a valid positive number",
        });
      }

      const update = {
        stock,
      };

      if (
        threshold !== undefined &&
        !Number.isNaN(threshold) &&
        threshold >= 0
      ) {
        update.threshold = threshold;
      }

      const item =
        await Inventory.findByIdAndUpdate(
          req.params.id,
          update,
          {
            new: true,
          }
        );

      res.json(item);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* ================================
   LOW STOCK EMAIL
================================ */

async function checkLowStock() {
  try {
    const items =
      await Inventory.find({
        $expr: {
          $lte: [
            "$stock",
            "$threshold",
          ],
        },
      });

    if (!items.length) {
      console.log(
        "Low-stock check: all stock levels are okay."
      );
      return;
    }

    const now = Date.now();

    const notifyItems = items.filter(
      (item) => {
        if (!item.lastNotifiedAt) {
          return true;
        }

        return (
          now -
            new Date(
              item.lastNotifiedAt
            ).getTime() >
          24 * 60 * 60 * 1000
        );
      }
    );

    if (!notifyItems.length) {
      return;
    }

    const list = notifyItems
      .map(
        (item) =>
          `<li><b>${item.name}</b> — Stock: ${item.stock}, Threshold: ${item.threshold}</li>`
      )
      .join("");

    const sent = await sendEmail(
      process.env.ADMIN_EMAIL,
      "⚠️ PizzaHub Low Stock Alert",
      `
        <div style="font-family:Arial;padding:30px">
          <h1 style="color:#e64d24">
            🍕 PizzaHub
          </h1>

          <h2>Low Stock Alert</h2>

          <p>
            The following inventory items are at
            or below their configured threshold:
          </p>

          <ul>
            ${list}
          </ul>

          <p>
            Please update the inventory from the
            Admin Dashboard.
          </p>
        </div>
      `
    );

    if (sent) {
      for (const item of notifyItems) {
        item.lastNotifiedAt = new Date();
        await item.save();
      }
    }
  } catch (error) {
    console.log(
      "Low-stock check error:",
      error.message
    );
  }
}

/*
  Every hour
*/

cron.schedule("0 * * * *", () => {
  console.log(
    "Running scheduled low-stock check..."
  );

  checkLowStock();
});


app.get("/api/check-admin", async (req, res) => {
  const admins = await User.find(
    { role: "admin" },
    { name: 1, email: 1, role: 1 }
  );

  res.json(admins);
});

/* ================================
   SERVER
================================ */

app.listen(
  process.env.PORT || 5000,
  () => {
    console.log(
      "Server running on http://localhost:5000"
    );
  }
);