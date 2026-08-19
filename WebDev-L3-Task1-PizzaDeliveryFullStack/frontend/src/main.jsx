import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const API = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(
  localStorage.getItem("userToken") ||
  localStorage.getItem("adminToken") ||
  ""
);

const [user, setUser] = useState(() => {
  const savedUser =
    localStorage.getItem("userData") ||
    localStorage.getItem("adminData");

  return savedUser
    ? JSON.parse(savedUser)
    : null;
});

  const [page, setPage] = useState("home");

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [showLogin, setShowLogin] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [register, setRegister] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const [builder, setBuilder] = useState(false);

  const [base, setBase] = useState("Classic Base");

  const [sauce, setSauce] = useState("Tomato Sauce");

  const [cheese, setCheese] = useState("Mozzarella");

  const [vegetables, setVegetables] = useState([]);

  const [summary, setSummary] = useState(null);

  /* ================================
     LOAD PRODUCTS
  ================================ */

  useEffect(() => {
    fetch(`${API}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() =>
        setMessage("Could not load products.")
      );
  }, []);

  /* ================================
     CHECK URL
  ================================ */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const verify = params.get("verify");
    const reset = params.get("reset");

    if (verify) {
      verifyEmail(verify);
    }

    if (reset) {
      setResetMode(true);
      setShowLogin(true);
      setForgot(false);
      setRegister(false);
    }
  }, []);

  /* ================================
     VERIFY EMAIL
  ================================ */

  async function verifyEmail(tokenValue) {
    try {
      const response = await fetch(
        `${API}/verify-email/${tokenValue}`
      );

      const data = await response.json();

      setMessage(data.message);

      window.history.replaceState(
        {},
        document.title,
        "/"
      );
    } catch {
      setMessage("Email verification failed.");
    }
  }

  /* ================================
     LOAD ORDERS
  ================================ */

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  async function loadOrders() {
    try {
      const response = await fetch(
        `${API}/orders/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch {
      console.log("Could not load orders");
    }
  }

  /* ================================
     REAL TIME POLLING
  ================================ */

  useEffect(() => {
    if (!token) return;

    const timer = setInterval(
      loadOrders,
      5000
    );

    return () => clearInterval(timer);
  }, [token]);

  /* ================================
     AUTH
  ================================ */

  async function handleAuth(e) {
    e.preventDefault();

    try {
      if (forgot) {
        const response = await fetch(
          `${API}/forgot-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: form.email,
            }),
          }
        );

        const data = await response.json();

        setMessage(data.message);
        return;
      }

      if (resetMode) {
        const params = new URLSearchParams(
          window.location.search
        );

        const resetToken = params.get("reset");

        const response = await fetch(
          `${API}/reset-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: resetToken,
              password: form.password,
            }),
          }
        );

        const data = await response.json();

        setMessage(data.message);

        if (response.ok) {
          setResetMode(false);
          setForgot(false);

          window.history.replaceState(
            {},
            document.title,
            "/"
          );
        }

        return;
      }

      const endpoint = register
        ? "/register"
        : "/login";

      const response = await fetch(
        API + endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      setMessage(data.message || "");
      if (
      adminLogin &&
      data.user?.role !== "admin"
) {
  setMessage("Admin account required.");
  return;
}

if (
  !adminLogin &&
  data.user?.role === "admin"
) {
  setMessage("Please use Admin Login.");
  return;
}

      if (data.token) {
  if (data.user.role === "admin") {
    localStorage.setItem(
      "adminToken",
      data.token
    );

    localStorage.setItem(
      "adminData",
      JSON.stringify(data.user)
    );
  } else {
    localStorage.setItem(
      "userToken",
      data.token
    );

    localStorage.setItem(
      "userData",
      JSON.stringify(data.user)
    );
  }

  setToken(data.token);
  setUser(data.user);

  setShowLogin(false);
  setPage("home");
}
    } catch {
      setMessage("Something went wrong.");
    }
  }

  /* ================================
     LOGOUT
  ================================ */

  function logout() {
  if (user?.role === "admin") {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  } else {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
  }

  setToken("");
  setUser(null);
  setOrders([]);
  setCart([]);

  setPage("home");
}


  /* 
     REMOVE FROM CART
  */

  function removeFromCart(index) {
    setCart((previousCart) =>
      previousCart.filter(
        (_, i) => i !== index
      )
    );

    setMessage("🍕 Removed from cart");
  }

  /* ================================
     OPEN CART SUMMARY
  ================================ */

  function checkoutCart() {
    if (!token) {
      setShowLogin(true);
      return;
    }

    setSummary({
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
      })),
      total: cartTotal,
      title: "Pizza Cart",
    });

    setPage("summary");
  }

  /* ================================
     BUILDER SUMMARY
  ================================ */

  function checkoutBuilder() {
    if (!token) {
      setBuilder(false);
      setShowLogin(true);
      return;
    }

    const items = [
      {
        base,
        sauce,
        cheese,
        vegetables,
      },
    ];

    setBuilder(false);

    setSummary({
      items,
      total: 599,
      title: "Custom Pizza",
    });

    setPage("summary");
  }

  /* ================================
     PAYMENT
  ================================ */

  async function placeOrder(
    items,
    total
  ) {
    if (!token) {
      setShowLogin(true);
      return;
    }

    try {
      setMessage(
        "Opening secure payment..."
      );

      const response = await fetch(
        `${API}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: total,
          }),
        }
      );

      const razorpayOrder =
        await response.json();

      if (!response.ok) {
        setMessage(
          razorpayOrder.message ||
            "Payment failed"
        );
        return;
      }

      const options = {
        key: razorpayOrder.key_id,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        name: "PizzaHub",

        description:
          "PizzaHub Order",

        order_id:
          razorpayOrder.id,

        handler:
          async function (
            paymentResponse
          ) {
            const orderResponse =
              await fetch(
                `${API}/orders`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                    Authorization:
                      `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    items,
                    total,

                    paymentId:
                      paymentResponse
                        .razorpay_payment_id,

                    razorpayOrderId:
                      paymentResponse
                        .razorpay_order_id,

                    signature:
                      paymentResponse
                        .razorpay_signature,
                  }),
                }
              );

            const data =
              await orderResponse.json();

            if (!orderResponse.ok) {
              setMessage(
                data.message ||
                  "Order verification failed."
              );
              return;
            }

            if (data._id) {
              setMessage(
                "🎉 Payment successful! Order placed."
              );

              setCart([]);
              setSummary(null);
              setPage("orders");

              loadOrders();
            }
          },

        prefill: {
          name:
            user?.name || "",

          email:
            user?.email || "",
        },

        theme: {
          color: "#e64d24",
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function () {
          setMessage(
            "❌ Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.log(error);

      setMessage(
        "Payment could not be started."
      );
    }
  }

  const cartTotal =
    cart.reduce(
      (sum, item) =>
        sum + item.price,
      0
    );

  /* ================================
     RETURN
  ================================ */

  return (
    <div>
      {/* NAVBAR */}

      <nav>
        <b
          onClick={() =>
            setPage("home")
          }
        >
          🍕 PizzaHub
        </b>

        <span>
          <a
            onClick={() =>
              setPage("home")
            }
          >
            Home
          </a>

          <a
            onClick={() =>
              setPage("menu")
            }
          >
            Menu
          </a>

          <a
            onClick={() =>
              setBuilder(true)
            }
          >
            Build Pizza
          </a>

          <a
            onClick={() =>
              setPage("orders")
            }
          >
            My Orders
          </a>

          {user?.role ===
            "admin" && (
            <a
              onClick={() =>
                setPage("admin")
              }
            >
              Admin
            </a>
          )}
        </span>

        {user ? (
          <button
            className="mini"
            onClick={logout}
          >
            Logout
          </button>
        ) : (
          <button
            className="mini"
            onClick={() =>
            {
        setRegister(false);
         setForgot(false);
        setResetMode(false);
        setAdminLogin(false);
        setShowLogin(true);
  }}
          >
            Login
          </button>
        )}

        <button
  className="mini"
  onClick={() => {
    setRegister(false);
    setForgot(false);
    setResetMode(false);
     setAdminLogin(true);
    setShowLogin(true);
  }}
>
  Admin Login
</button>
      </nav>

      {/* HOME */}

      {page === "home" && (
        <>
          <section className="hero">
            <div>
              <label>
                🔥 Fresh • Fast • Delicious
              </label>

              <h1>
                Your Perfect
                <br />
                <em>
                  Pizza, Your Way.
                </em>
              </h1>

              <p>
                Delicious pizzas made
                with fresh ingredients
                and delivered hot to
                your doorstep.
              </p>

              <button
                onClick={() =>
                  setPage("menu")
                }
              >
                Order Now →
              </button>
            </div>

            <img
              src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000"
              alt="Pizza"
            />
          </section>

          <section>
            <h2>
              Why Choose PizzaHub?
            </h2>

            <div className="benefits">
              <div>
                🚀
                <b>
                  Fast Delivery
                </b>
                <p>
                  Hot pizza at your
                  doorstep.
                </p>
              </div>

              <div>
                🧀
                <b>
                  Fresh Ingredients
                </b>
                <p>
                  Quality ingredients
                  every time.
                </p>
              </div>

              <div>
                ❤️
                <b>
                  Made With Love
                </b>
                <p>
                  Crafted specially
                  for pizza lovers.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>
              Popular Pizzas
            </h2>

            <div className="grid">
              {products.map(
                (pizza) => (
                  <article
                    key={pizza.name}
                  >
                    <img
                      src={pizza.img}
                      alt={pizza.name}
                    />

                    <div>
                      <h3>
                        {pizza.name}
                      </h3>

                      <p>
                        {pizza.desc}
                      </p>

                      <strong>
                        ₹{pizza.price}
                      </strong>

                      <button
                        onClick={() => {
                          setCart([
                            ...cart,
                            pizza,
                          ]);

                          setMessage(
                            "🍕 Added to cart"
                          );
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        </>
      )}

      {/* MENU */}

      {page === "menu" && (
        <section className="content">
          <h1>
            🍕 Our Pizza Menu
          </h1>

          <div className="grid">
            {products.map(
              (pizza) => (
                <article
                  key={pizza.name}
                >
                  <img
                    src={pizza.img}
                    alt={pizza.name}
                  />

                  <div>
                    <h3>
                      {pizza.name}
                    </h3>

                    <p>
                      {pizza.desc}
                    </p>

                    <strong>
                      ₹{pizza.price}
                    </strong>

                    <button
                      onClick={() => {
                        setCart([
                          ...cart,
                          pizza,
                        ]);

                        setMessage(
                          "🍕 Added to cart!"
                        );
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              )
            )}
          </div>

          <div className="cart">
            <h2>
              🛒 Cart ({cart.length})
            </h2>

            {cart.length === 0 && (
              <p>
                Your cart is empty.
              </p>
            )}

            {cart.map(
              (item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span>
                    {item.name} — ₹
                    {item.price}
                  </span>

                  <button
                    onClick={() =>
                      removeFromCart(index)
                    }
                  >
                    Remove
                  </button>
                </div>
              )
            )}

            {cart.length > 0 && (
              <>
                <h3>
                  Total: ₹
                  {cartTotal}
                </h3>

                <button
                  onClick={
                    checkoutCart
                  }
                >
                  Continue to
                  Summary →
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* ORDER SUMMARY */}

      {page === "summary" &&
        summary && (
          <section className="content">
            <h1>
              🧾 Order Summary
            </h1>

            <div className="cart">
              <h2>
                {summary.title}
              </h2>

              {summary.items.map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      background:
                        "#fff",
                      padding:
                        "15px",
                      borderRadius:
                        "10px",
                      marginBottom:
                        "10px",
                    }}
                  >
                    {item.name && (
                      <b>
                        {item.name}
                      </b>
                    )}

                    {item.base && (
                      <>
                        <p>
                          Base:{" "}
                          {item.base}
                        </p>

                        <p>
                          Sauce:{" "}
                          {item.sauce}
                        </p>

                        <p>
                          Cheese:{" "}
                          {item.cheese}
                        </p>

                        <p>
                          Vegetables:{" "}
                          {item.vegetables
                            ?.join(
                              ", "
                            ) ||
                            "None"}
                        </p>
                      </>
                    )}

                    {item.price && (
                      <strong>
                        ₹{item.price}
                      </strong>
                    )}
                  </div>
                )
              )}

              <hr />

              <h2>
                Total: ₹
                {summary.total}
              </h2>

              <button
                onClick={() =>
                  placeOrder(
                    summary.items,
                    summary.total
                  )
                }
              >
                💳 Pay with Razorpay
              </button>

              <button
                style={{
                  marginLeft:
                    "10px",
                }}
                onClick={() => {
                  setSummary(null);
                  setPage("menu");
                }}
              >
                ← Back
              </button>
            </div>
          </section>
        )}

      {/* ORDERS */}

      {page === "orders" && (
        <section className="content">
          <h1>
            📦 My Orders
          </h1>

          {!token ? (
            <div className="cart">
              <h3>
                Please login to see
                your orders.
              </h3>

              <button
                onClick={() =>
                  setShowLogin(true)
                }
              >
                Login
              </button>
            </div>
          ) : orders.length ===
            0 ? (
            <div className="cart">
              <h3>
                No orders yet.
              </h3>

              <button
                onClick={() =>
                  setPage("menu")
                }
              >
                Order Pizza
              </button>
            </div>
          ) : (
            orders.map(
              (order) => (
                <div
                  className="order"
                  key={order._id}
                >
                  <b>
                    Order #
                    {order._id.slice(
                      -6
                    )}
                  </b>

                  <span>
                    ₹{order.total}
                  </span>

                  <strong>
                    {order.status}
                  </strong>
                  <button
           onClick={() => {
           setPage("tracking");
           setSummary(order);
           }}
           >
           Track Order
          </button>
                </div>
              )
            )
          )}
        </section>
      )}

      {/* ORDER TRACKING */}

{page === "tracking" && summary && (
  <section className="content tracking-page">
    <h1>📦 Track Your Order</h1>

    <div className="tracking-card">

      <div className="tracking-header">
        <div>
          <h2>
            Order #{summary._id.slice(-6)}
          </h2>

          <p>
            Total: ₹{summary.total}
          </p>
        </div>

        <strong>
          {summary.status}
        </strong>
      </div>

      <div className="tracking-line">

        <div
          className={
            [
              "Order Received",
              "In Kitchen",
              "Sent to Delivery",
              "Delivered",
            ].indexOf(summary.status) >= 0
              ? "tracking-step active"
              : "tracking-step"
          }
        >
          <span>✓</span>
          <div>
            <b>Order Received</b>
            <small>Your order has been received</small>
          </div>
        </div>

        <div
          className={
            [
              "In Kitchen",
              "Sent to Delivery",
              "Delivered",
            ].includes(summary.status)
              ? "tracking-step active"
              : "tracking-step"
          }
        >
          <span>✓</span>
          <div>
            <b>In Kitchen</b>
            <small>Your pizza is being prepared</small>
          </div>
        </div>

        <div
          className={
            [
              "Sent to Delivery",
              "Delivered",
            ].includes(summary.status)
              ? "tracking-step active"
              : "tracking-step"
          }
        >
          <span>✓</span>
          <div>
            <b>Sent to Delivery</b>
            <small>Your pizza is on the way</small>
          </div>
        </div>

        <div
          className={
            summary.status === "Delivered"
              ? "tracking-step active"
              : "tracking-step"
          }
        >
          <span>✓</span>
          <div>
            <b>Delivered</b>
            <small>Enjoy your PizzaHub order 🍕</small>
          </div>
        </div>

      </div>

      <button
        onClick={() => {
          setSummary(null);
          setPage("orders");
        }}
      >
        ← Back to My Orders
      </button>

    </div>
  </section>
)}

      {/* ADMIN */}

      {page === "admin" &&
        user?.role ===
          "admin" && (
          <Admin
            token={token}
          />
        )}

      {/* CUSTOM BUILDER */}

      {builder && (
        <div className="modal">
          <div className="modalbox">
            <button
              className="close"
              onClick={() =>
                setBuilder(false)
              }
            >
              ×
            </button>

            <h2>
              🍕 Build Your Own
              Pizza
            </h2>

            <Choice
              title="1. Choose Pizza Base"
              options={[
                "Classic Base",
                "Thin Crust",
                "Cheese Burst",
                "Whole Wheat",
                "Italian Base",
              ]}
              value={base}
              setValue={setBase}
            />

            <Choice
              title="2. Choose Sauce"
              options={[
                "Tomato Sauce",
                "Pesto Sauce",
                "BBQ Sauce",
                "Garlic Sauce",
                "Spicy Sauce",
              ]}
              value={sauce}
              setValue={setSauce}
            />

            <Choice
              title="3. Choose Cheese"
              options={[
                "Mozzarella",
                "Cheddar",
                "Parmesan",
                "Gouda",
                "Vegan Cheese",
              ]}
              value={cheese}
              setValue={setCheese}
            />

            <h3>
              4. Choose
              Vegetables
            </h3>

            <div className="opts">
              {[
                "Capsicum",
                "Onion",
                "Corn",
                "Olives",
                "Mushroom",
              ].map(
                (item) => (
                  <label
                    key={item}
                  >
                    <input
                      type="checkbox"
                      checked={vegetables.includes(
                        item
                      )}
                      onChange={(e) => {
                        if (
                          e.target
                            .checked
                        ) {
                          setVegetables(
                            [
                              ...vegetables,
                              item,
                            ]
                          );
                        } else {
                          setVegetables(
                            vegetables.filter(
                              (v) =>
                                v !==
                                item
                            )
                          );
                        }
                      }}
                    />

                    {item}
                  </label>
                )
              )}
            </div>

            <hr />

            <h3>
              Order Summary
            </h3>

            <p>
              Base: {base}
            </p>

            <p>
              Sauce: {sauce}
            </p>

            <p>
              Cheese: {cheese}
            </p>

            <p>
              Vegetables:{" "}
              {vegetables.join(
                ", "
              ) || "None"}
            </p>

            <h2>
              ₹599
            </h2>

            <button
              onClick={
                checkoutBuilder
              }
            >
              Continue to
              Summary →
            </button>
          </div>
        </div>
      )}

      {/* LOGIN / REGISTER / FORGOT */}

      {showLogin && (
        <div className="modal">
          <div className="modalbox authbox">
            <button
              className="close"
              onClick={() => {
                setShowLogin(false);
                setForgot(false);
                setResetMode(false);
                setAdminLogin(false);
              }}
            >
              
            </button>

            <div className="logo">
              🍕 PizzaHub
            </div>

            <h2>
              {resetMode
              ? "Reset Password"
              : forgot
               ? "Forgot Password"
              : register
              ? "Create Account"
              : adminLogin
              ? "Admin Login"
              : "Customer Login"}
             </h2>  

            <form
              onSubmit={
                handleAuth
              }
            >
              {register && (
                <input
                  placeholder="Full Name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target
                        .value,
                    })
                  }
                />
              )}

              {!resetMode && (
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email:
                        e.target.value,
                    })
                  }
                />
              )}

              {!forgot && (
                <input
                  type="password"
                  placeholder={
                    resetMode
                      ? "New Password"
                      : "Password"
                  }
                  required
                  value={
                    form.password
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password:
                        e.target.value,
                    })
                  }
                />
              )}

              <button type="submit">
                {resetMode
                  ? "Reset Password"
                  : forgot
                  ? "Send Reset Link"
                  : register
                  ? "Create Account"
                  : "Login"}
              </button>
            </form>

            <p>
              {message}
            </p>

            {!resetMode &&
              !forgot &&
              !register && (
                <a
                  onClick={() => {
                    setForgot(true);
                    setMessage("");
                  }}
                >
                  Forgot Password?
                </a>
              )}

            {!resetMode && (
              <a
                onClick={() => {
                  setForgot(false);
                  setRegister(
                    !register
                  );
                  setMessage("");
                }}
              >
                {register
                  ? "Already have an account? Login"
                  : forgot
                  ? "Back to Login"
                  : "New user? Create Account"}
              </a>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}

      {message &&
        !showLogin && (
          <div className="toast">
            {message}
          </div>
        )}

      {/* FOOTER */}
<footer className="footer">

  <div className="footer-main">

    <div className="footer-brand">
      <h2>
        <i className="fa-solid fa-pizza-slice"></i>
        PizzaHub
      </h2>

      <p>
        Fresh pizza. Fast delivery.
        <br />
        Happy customers.
      </p>

      <div className="social-icons">
        <a href="#" aria-label="Instagram">
          <i className="fa-brands fa-instagram"></i>
        </a>

        <a href="#" aria-label="Facebook">
          <i className="fa-brands fa-facebook-f"></i>
        </a>

        <a href="#" aria-label="LinkedIn">
          <i className="fa-brands fa-linkedin-in"></i>
        </a>
      </div>
    </div>

    <div className="footer-links">
      <h3>Quick Links</h3>

      <a onClick={() => setPage("home")}>
        Home
      </a>

      <a onClick={() => setPage("menu")}>
        Menu
      </a>

      <a onClick={() => setBuilder(true)}>
        Build Pizza
      </a>

      <a onClick={() => setPage("orders")}>
        My Orders
      </a>
    </div>

    <div className="footer-contact">
      <h3>Contact Us</h3>

      <p>
        <i className="fa-solid fa-location-dot"></i>
        Pune, Maharashtra
      </p>

      <p>
        <i className="fa-solid fa-phone"></i>
        +91 9322128117
      </p>

      <p>
        <i className="fa-solid fa-envelope"></i>
        support@pizzahub.com
      </p>
    </div>

  </div>

  <div className="footer-bottom">
    <small>
      © 2026 PizzaHub. All rights reserved.
    </small>

    <span>
      Made with <i className="fa-solid fa-heart"></i> for pizza lovers
    </span>
  </div>

</footer>
    </div>
  );
}

/* ================================
   CHOICE COMPONENT
================================ */

function Choice({
  title,
  options,
  value,
  setValue,
}) {
  return (
    <div>
      <h3>{title}</h3>

      <div className="opts">
        {options.map(
          (option) => (
            <button
              type="button"
              key={option}
              className={
                value === option
                  ? "sel"
                  : ""
              }
              onClick={() =>
                setValue(
                  option
                )
              }
            >
              {option}
            </button>
          )
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN DASHBOARD
================================ */

function Admin({
  token,
}) {
  const [orders, setOrders] =
    useState([]);

  const [
    inventory,
    setInventory,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function loadOrders() {
    try {
      const response =
        await fetch(
          `${API}/orders`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch {
      console.log(
        "Orders loading failed"
      );
    }
  }

  async function loadInventory() {
    try {
      const response =
        await fetch(
          `${API}/inventory`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (Array.isArray(data)) {
        setInventory(data);
      }
    } catch {
      console.log(
        "Inventory loading failed"
      );
    }
  }

  useEffect(() => {
    loadOrders();
    loadInventory();
  }, []);

  async function changeStatus(
    id,
    status
  ) {
    const response =
      await fetch(
        `${API}/orders/${id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      alert(
        data.message ||
          "Status update failed"
      );

      return;
    }

    setOrders(
      (previous) =>
        previous.map(
          (order) =>
            order._id === id
              ? data
              : order
        )
    );
  }

  async function seedInventory() {
    setLoading(true);

    const response =
      await fetch(
        `${API}/inventory/seed`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const data =
      await response.json();

    setMessageSafe(
      data.message
    );

    await loadInventory();

    setLoading(false);
  }

  async function updateStock(
    id,
    stock,
    threshold
  ) {
    const response =
      await fetch(
        `${API}/inventory/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            stock,
            threshold,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      alert(
        data.message ||
          "Stock update failed"
      );

      return;
    }

    setInventory(
      (previous) =>
        previous.map(
          (item) =>
            item._id === id
              ? data
              : item
        )
    );
  }

  function setMessageSafe(text) {
    alert(text);
  }

  const lowStock =
    inventory.filter(
      (item) =>
        item.stock <=
        item.threshold
    ).length;

  return (
    <section className="content">
      <h1>
        👨‍💼 Admin Dashboard
      </h1>

      <div className="stats">
        <div>
          📦
          <b>
            {orders.length}
          </b>
          <small>
            Total Orders
          </small>
        </div>

        <div>
          🍕
          <b>
            {inventory.length}
          </b>
          <small>
            Inventory Items
          </small>
        </div>

        <div>
          ⚠️
          <b>
            {lowStock}
          </b>
          <small>
            Low Stock Items
          </small>
        </div>
      </div>

      {/* ORDERS */}

      <h2>
        Order Management
      </h2>

      {orders.length === 0 ? (
        <div className="cart">
          No orders available.
        </div>
      ) : (
        orders.map(
          (order) => (
            <div
              className="order"
              key={order._id}
            >
              <b>
                #
                {order._id.slice(
                  -6
                )}
              </b>

              <span>
                ₹{order.total}
              </span>

              <select
                value={
                  order.status
                }
                onChange={(e) =>
                  changeStatus(
                    order._id,
                    e.target.value
                  )
                }
              >
                <option>
                  Order Received
                </option>

                <option>
                  In Kitchen
                </option>

                <option>
                  Sent to Delivery
                </option>
                <option>
                  Delivered
                </option>
              </select>
            </div>
          )
        )
      )}

      {/* INVENTORY */}

      <h2>
        Inventory Dashboard
      </h2>

      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        <button
          onClick={
            seedInventory
          }
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "🌱 Seed / Reset Inventory"}
        </button>
      </div>

      {inventory.length === 0 ? (
        <div className="cart">
          <h3>
            No inventory available.
          </h3>

          <p>
            Click the button above
            to create inventory items.
          </p>
        </div>
      ) : (
        inventory.map(
          (item) => (
            <InventoryRow
              key={item._id}
              item={item}
              updateStock={
                updateStock
              }
            />
          )
        )
      )}
    </section>
  );
}

/* ================================
   INVENTORY ROW
================================ */

function InventoryRow({
  item,
  updateStock,
}) {
  const [stock, setStock] =
    useState(item.stock);

  const [
    threshold,
    setThreshold,
  ] = useState(
    item.threshold
  );

  const isLow =
    stock <= threshold;

  return (
    <div
      className="order"
      style={{
        flexWrap: "wrap",
        borderLeft: isLow
          ? "5px solid #e64d24"
          : "5px solid #4caf50",
      }}
    >
      <div
        style={{
          minWidth: "180px",
        }}
      >
        <b>
          {item.name}
        </b>

        <small
          style={{
            display: "block",
            color: "#777",
            marginTop: "5px",
          }}
        >
          {item.category}
        </small>
      </div>

      <label>
        Stock:
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) =>
            setStock(
              Number(
                e.target.value
              )
            )
          }
          style={{
            width: "90px",
            marginLeft: "8px",
            padding: "8px",
            border:
              "1px solid #ddd",
            borderRadius: "7px",
          }}
        />
      </label>

      <label>
        Threshold:
        <input
          type="number"
          min="0"
          value={threshold}
          onChange={(e) =>
            setThreshold(
              Number(
                e.target.value
              )
            )
          }
          style={{
            width: "90px",
            marginLeft: "8px",
            padding: "8px",
            border:
              "1px solid #ddd",
            borderRadius: "7px",
          }}
        />
      </label>

      <strong
        style={{
          color: isLow
            ? "#e64d24"
            : "#3c9b52",
        }}
      >
        {isLow
          ? "⚠️ Low Stock"
          : "✓ In Stock"}
      </strong>

      <button
        onClick={() =>
          updateStock(
            item._id,
            stock,
            threshold
          )
        }
      >
        Save
      </button>
    </div>
  );
}

createRoot(
  document.getElementById(
    "root"
  )
).render(<App />);