import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Header = () => {
  let {user, logoutUser, admin} = useContext(AuthContext);
  return (
    <div>
  <div className="navbar">
    <NavLink to="/" className="logo">
      <img src="/Algorithmix.png" alt="Algorithmix" className="logo-img" />
    </NavLink>
    <div className="navbar-right">
      {(admin && user) && (
        <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>Panel</NavLink>
      )}
      {(admin && user) && (
        <NavLink to="/problem" className={({ isActive }) => isActive ? "active" : ""}>Problem</NavLink>
      )}
      <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} end>Home</NavLink>
      {user ? (
        <NavLink to="/Login" onClick={logoutUser} className={({ isActive }) => isActive ? "active" : ""}>Logout</NavLink>
      ) : (
        <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink>
      )}
      <NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>Register</NavLink>
    </div>
  </div>
  <div className='space'>

  </div>
</div>
  );
}

export default Header;