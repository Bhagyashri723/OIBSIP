import React from 'react'
import { TypeAnimation } from 'react-type-animation';
import { FaArrowDown, FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';
import Tilt from 'react-parallax-tilt';


const Hero = () => {
  return (

         <section id="home" className=" h-screen ">
            <Tilt
            tiltMaxAngleX={8}
            tiltMaxAngleY={8}
            tiltScale={1.02}
            transitionSpeed={800}
           >
           
         <div className=' flex items-center justify-center pt-20 px-4 sm:px-6 pb-6'>
          <div className="w-full max-w-xl bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col  items-center h-auto">
        
            <div className="flex flex-col items-center space-y-4 text-center pb-1">
                 <img
                 className='object-cover object-center rounded-full  border-1 border-blue-300  w-48 h-48 shadow-lg shadow-cyan-800 hover:scale-105 transition duration-300' 
                 alt="hero"
                    src="./bhagyashri.jpg" />
                 </div>
        
              <h1 className='title-font sm:text-2xl text-1xl md:text-3xl  font-semibold text-white tracking-wide drop-shadow-lg'> Hi, I'm Bhagyashri.
              <br className='hidden lg:inline-block'/>
                 </h1>
              <TypeAnimation
               sequence={[
                 
                  "React Developer.",
                  2000,
                  "Full Stack Developer",
                   2000,
                   "Frontend Developer",
                   2000
               ]}
               wrapper='span'
               speed={60}
               repeat={Infinity}
                className=" font-medium text-emerald-400 text-lg sm:text-xl md:text-2xl text-center w-fit mx-auto tracking-wide"
               />
            

              <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <a 
             href="https://www.linkedin.com/in/bhagyashrikhond/"
             target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-lg transition duration-300 ease-in-out hover:bg-white/20 hover:border-emerald-500 hover:-translate-y-1 shadow-emerald-500/20 text-base"
       >
            <FaLinkedin />
            LinkedIn
          </a>

        <a 
           href="https://github.com/Bhagyashri723"
           target="_blank"
          rel="noopener noreferrer"
           className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-lg transition duration-300 ease-in-out hover:bg-white/20 hover:border-emerald-500 hover:-translate-y-1 shadow-emerald-500/20 text-base"
>
         <FaGithub />
              GitHub
          </a>

          <a 
           href="/resume.pdf"
            target="_blank"
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-lg transition duration-300 ease-in-out hover:bg-white/20 hover:border-emerald-500 hover:-translate-y-1 shadow-emerald-500/20 text-base"
           >
      <HiOutlineDocumentText />
      Resume
       </a>
         </div>
              
            </div>
            </div>
            </Tilt>

            <div className=" sticky top-[85vh] transform  flex flex-col justify-center items-center  animate-bounce  ">
           <div className="   w-10 h-10  border border-gray-300 rounded-full flex  items-center justify-center shadow-emerald-500/20 shadow-lg">
          <span className="text-gray-300 text-lg">↓</span>
           </div>
           <span className="text-gray-300 text-sm mt-1">
             Scroll Down
           </span>
         </div>
             
    </section>
  );
};

export default Hero;