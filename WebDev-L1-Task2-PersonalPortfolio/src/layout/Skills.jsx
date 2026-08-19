import React from 'react'
import { BadgeCheckIcon, ChipIcon } from "@heroicons/react/solid";

import{ skills } from '../Data'

const Skills = () => {
  return (
    <section  id="skills">
      <div className='w-full px-2 sm:px-4 py-10'>
        <ChipIcon className='w-10 inline-block mb-4'/>
        <h1 className='sm:text-4xl text-3xl font-medium title-font text-white mb-4'> Skills &amp; Technologies</h1>

        <p className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto text-gray-300">
           I have strong knowledge of frontend web development and programming
           languages. I build responsive and interactive web applications using
           HTML, CSS, JavaScript, and React. I am also familiar with programming
           languages such as C, C++, Java, Python, and PHP. Additionally, I use
           Git and GitHub for version control and project management.
       </p>
      </div>
      <div className='flex flex-wrap w-full sm:mb-2 -mx-2 px-2 sm:px-4'>
      {skills.map((skill)=>(
        <div key={skill} className='p-2 sm:w-1/2 w-full'>
          <div className='bg-gray-800 rounded flex p-4 h-full items-center'>
            <BadgeCheckIcon className='text-green-400 w-6 h-6 flex-shrink-0 mr-4' />
            <span className='title-font font-medium text-white'>{skill}</span>
          </div>
        </div>
      ))}
      </div>

    </section>
  );
}

export default Skills;