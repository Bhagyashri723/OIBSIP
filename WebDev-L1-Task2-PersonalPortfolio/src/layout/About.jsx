import React from 'react'





const About = () => {
 
  
  return (
    <section id="about"  className="py-12 px-4">
      {/* <h1 className="text-4xl md:text-6xl  ml-6 text-left font-semibold text-purple-400 mb-3">About Me</h1> */}

      <h1 className="text-3xl md:text-5xl ml-6 pb-4  text-left font-semibold bg-gradient-to-r text-white  text-transparent bg-clip-text">
  About Me
   </h1>

    <div className="flex flex-col md:flex-row items-center justify-between gap-8  py-12 max-w-4xl mx-auto md:py-20 bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div  className="md:w-2/5 flex justify-start"> 
                 <img
                 className='object-cover object-center ml-6 rounded-xl border-1  border-blue-300 w-full max-w-xs md:max-w-sm  h-85 shadow-lg shadow-cyan-800 hover:scale-105 transition duration-300' 
                 alt="hero"
                    src="./bhagyashri.jpg" />
                 </div>
      <div className="md:w-3/5 text-left">
        
    <p className="mb-4 mt-2 leading-relaxed text-lg sm:text-xl text-gray-300">
       <span className="block text-xl md:text-2xl font-semibold text-blue-300">
      Hi, I’m Bhagyashri,
     </span>
     a passionate Frontend Developer who builds responsive and user-friendly web applications using HTML, CSS, JavaScript, React, and Tailwind CSS. I love designing clean, modern, and visually appealing interfaces that provide a seamless user experience.
  
      I enjoy turning ideas into real-world projects and continuously improving my skills by learning new technologies and best practices. As a BCA student, I am actively working on projects to strengthen my development skills and grow as a professional developer.
</p>
      </div>
      </div>
     
  
    </section>
  );
}

export default About;