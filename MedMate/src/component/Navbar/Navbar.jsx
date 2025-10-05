import React from 'react'
import './Navbar.css'
import logo from '../../assets/logo.jpg'
import { Link, NavLink} from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className='container'>
        <div className="logo-name">
          <img src={logo} alt="" className='logo'/>
          <span>MedMate</span>

        </div>

      <ul>
          <NavLink to='/'><li>Home</li></NavLink>
          {/* <NavLink to='/'><li>About us</li></NavLink> */}
          <NavLink to='/new'><li>New Diagnosis</li></NavLink>
          <NavLink to='/prev'><li><button className='btn'>Previous Diagnosis</button></li></NavLink>
      </ul>
        
    </nav>
  )
}

export default Navbar
