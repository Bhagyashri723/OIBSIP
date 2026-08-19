import React from 'react'
import {ArrowRightIcon} from '@heroicons/react/solid';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';

const Navbar = () => {
  return (
    <header className='bg-gray-800 md:sticky top-0 z-10 py-2'>
      <div className="w-full flex px-4 py-3 items-center justify-between">

        <div className=' font-medium text-white -mt-4'>
          <a href='#about' className="text-white text-base md:text-xl  font-medium">
             Bhagyashri Khond
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 mt-1 shrink-0">

        <nav className="flex justify-center gap-2 md:gap-2 text-sm mt-2 md:mt-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:text-base">

            <a href="#home" className='  text-white'>Home</a>
            <a href="#about" className='  text-white'>About</a>
            <a href="#projects" className='  text-white'>Projects</a>
            <a href="#skills" className='  text-white'>Skills</a>




           </nav>
           <div className="flex items-center gap-2 text-white">
          <a href="https://github.com/Bhagyashri723" target="_blank">
           <FaGithub className="w-5 h-5" />
          </a>

           <a href="https://www.linkedin.com/in/bhagyashrikhond/" target="_blank">
         <FaLinkedin className="w-5 h-5" />
          </a>

           <a 
            href="/resume.pdf"
            target="_blank"
            className=""
            >
         <HiOutlineDocumentText style={{ width: "20px", height: "20px" }} />
      
         </a>
        </div>
        </div>
        </div>
       </header>
  );
}

export default Navbar;