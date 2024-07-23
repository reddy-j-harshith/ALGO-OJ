import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Header = () => {
  let {user, logoutUser, admin} = useContext(AuthContext);
  return (
    <div>
      <div className="navbar">
        <a href="/" className="logo">
        <img src="/Algorithmix.png" alt="Algorithmix" className="logo-img" />
        </a>
        <div className="navbar-right">
          {admin ? (
            <Link to="/admin">Admin</Link>
          ) : null}
          {admin ? (
            <Link to="/problem">New Problem</Link>
          ) : null}
          <a className="active" href="/">Home</a>
          {user ? (
            <Link to="/Login" onClick={logoutUser}>Logout</Link>
          ) : (
            <Link to="/login">Login</Link>
          )}
          <a href="/register">Register</a>
        </div>
      </div>
      <div className='space'>

      </div>
    </div>
  );
}

export default Header;
