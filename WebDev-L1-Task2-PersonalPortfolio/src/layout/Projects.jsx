import React from 'react'
import { projects } from '../Data'
import { CodeIcon } from "@heroicons/react/solid"
const Projects = () => {
  return (
    <section id='projects' className='text-gray-400 bg-transparent body-font'>
     <div className='w-full px-2 sm:px-4 py-4 text-center'>
   <div className='flex flex-col w-full mb-8 sm:mb-10'>
    

    <a href="#skills">
  <CodeIcon className="mx-auto w-10  cursor-pointer" />
</a>
    <h1 className='sm:text-3xl text-2xl md:text-4xl font-medium title-font mb-4 text-white'>
     Projects I've Built
    </h1>
     <p className="lg:w-2/3 mx-auto leading-relaxed text-gray-100  text-sm sm:text-base md:text-xl  tracking-wide">
          Showcasing front-end projects built with React, JavaScript, and modern web technologies.
     </p>
   </div>
   
   <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
    
     {projects.map((project)=>(
    <a
  href={project.link}
  key={project.image}
  className='w-full '>
  
  <div className=' w-full overflow-hidden   border border-white/20 bg-white/10 shadow-lg  backdrop-blur-md p-4'>

  <div className=' mb-1'>
    <h1 className="title-font text-base sm:text-lg font-medium text-white ">
        {project.title}
      </h1>
        <p className="text-sm sm:text-base 
        text-gray-200  leading-relaxed mb-2">
        {project.description}
      </p>
      
      
      <div className="flex flex-wrap gap-2 mb-2 justify-center text-center ">
  {project.tech.map((item, i) => (
    <span key={i} className="bg-blue-500/20 text-white hover:bg-blue-500/30 px-2 py-1 rounded-full text-xs">
      {item}
    </span>
  ))}
    </div>
    
    </div>
    
    <img
      alt="gallery"
      className=' w-full h-60 object-cover  object-center rounded-t-lg'
      src={project.image}
    />

    
    
    
  </div>
</a>
      
      ))}
   </div>
      </div>

    </section>
  );
}

export default Projects;