import React from 'react'
import './Hero.css'
import { useNavigate } from 'react-router-dom'


const Hero = () => {

  const navigate = useNavigate();

  return (
    <div className='hero container'>
      <div className="hero-text">
        <h1>AI Copilot for Healthcare Workers</h1>
        <p>Your intelligent assistant for faster and more accurate diagnostics.</p>
        <button onClick={()=> navigate('/new')} className='btn' id='btnsp'>New Diagnosis</button>
        <button onClick={()=> navigate('/prev')} className='btn'>Previous Diagnoses</button>
      </div>
    </div>
  )
}

export default Hero
