import React from "react";
import dsImg from "./assets/ds.jpg";
import labImg from "./assets/lab.jpg";
import { FaGraduationCap, FaSchool, FaTrophy } from "react-icons/fa";
import Tilt from 'react-parallax-tilt';

const data = [
  {
    icon:<FaSchool />,
     type: "education",
  title: " Higher Secondary Education (12th)",
  year: "2022 – 2023",
  desc: "Shri Shivaji College | Maharashtra State Board | 82.83%\nDemonstrated consistent academic performance and built a strong academic foundation.",
  img: null,
  pdf: null,
},
 {
   icon:<FaGraduationCap />,
    type: "education",
  title: "🎓 Bachelor of Computer Applications (BCA)",
  year: "2023 – Present",
  desc: "St. Mira’s College, Pune | CGPA: 8+ \n Focused on Web Development, Programming Fundamentals, and Problem Solving",
  img: null,
  pdf: null,
},
  {
    icon:<FaTrophy />,
      type: "certificate",
    title: " Highest Marks – Data Structures Lab",
    year: "2024-25",
    desc: "Demonstrated strong problem-solving and coding fundamentals.",
    img: dsImg,
    pdf: "/certificates/ds.pdf",
  },
  {
    icon:<FaTrophy />,
      type: "certificate",
    title: "🥇 Highest Marks – Lab Course II",
    year: "2023-24",
    desc: "Consistent academic excellence in core subjects.",
    img: labImg,
    pdf: "/certificates/lab.pdf",
  },
];

const Achievements = () => {
  return (
    <section className="bg-[#0f172a] py-16 px-4">
      <h2 className="text-3xl font-bold text-center text-white mb-12">
        Achievements & Academic Excellence
      </h2>

      <div className="relative max-w-5xl mx-auto">

        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 w-1 bg-gray-700 h-full transform -translate-x-1/2"></div>

        {data.map((item, index) => (
          <div
            key={index}
            className={`mb-12 flex flex-col md:flex-row items-center ${
              index % 2 === 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Card */}
            <div className="w-full md:w-1/2 p-4 flex">
           <div className={`
              w-full 
             bg-gradient-to-br from-white/10 to-white/5
              backdrop-blur-2xl 
               border border-white/25
               rounded-2xl 
                p-4 
               shadow-[0_6px_24px_0_rgba(255,255,255,0.12)]
               transition duration-300 
              hover:scale-105 
              flex flex-col
              hover:shadow-2xl
               ${item.type === "certificate" ? "p-4" : "p-3"}
              `}  >

              {item.img && (
              <div className={`
                w-full overflow-hidden rounded-xl
                ${item.type === "certificate" ? "h-32" : ""}
                  `}>
              <img
               src={item.img}
               alt="certificate"
               className="w-full h-full object-cover"
               />
             </div>
                 )}
               
                <h3 className="text-white text-lg font-semibold">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm  mt-1">{item.year}</p>

                <p className="text-gray-300 text-sm mt-2 whitespace-pre-line leading-relaxed ">{item.desc}</p>

               {item.pdf &&(
                 <a
                  href={item.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-fit self-center"
                >
                  View Certificate
                </a>
               )}
              </div>
            </div>

            {/* Circle */}
           <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full border-4 border-gray-900 z-10  shadow-lg  hover:scale-110 transition">
           {item.icon}
           </div>

            {/* Empty Space */}
            <div className="hidden md:block w-1/2"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Achievements;