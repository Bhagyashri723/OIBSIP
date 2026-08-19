import { useState } from 'react'

import './App.css'
import Navbar from './layout/Navbar'
import About from './layout/About'
import Projects from './layout/Projects'
import Skills from './layout/Skills'

import Contact from './layout/Contact'
import Particles from './Particles'
import Hero from './layout/Hero'
import Achievements from './Achievements'



function App() {
  

  return (
    <div className='w-full min-h-[100vh] relative bg-black'>
      <div className='fixed top-0 left-0 w-full h-full z-0'>
         <Particles
    particleColors={["#ffffff"]}
    particleCount={200}
    particleSpread={10}
    speed={0.1}
    particleBaseSize={100}
    moveParticlesOnHover
    alphaParticles={false}
    disableRotation={false}
    pixelRatio={1}
/>
 
   </div> 
   <div className="relative z-10  ">
     <Navbar />
    <Hero />   
    <About />
     <Skills />
    <Projects />
    <Achievements />
    <Contact />
   
</div>
  
</div>
   
  
  )
}

export default App
