import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import './Navbar.css'

const Header = () => {
  let {user, logoutUser} = useContext(AuthContext)
  return (
    <div class="navbar">
      <a href="/" class="logo">CompanyLogo</a>
      <div class="navbar-right">
        <a class="active" href="/">Home</a>
        {user ? (
          <Link href="/Login" onClick={logoutUser}>Logout</Link>
        ) : (
          <Link href="/login">Login</Link>
        )}
        <a href="/register">Register</a>
      </div>
    </div>
  )
}




export default Header
