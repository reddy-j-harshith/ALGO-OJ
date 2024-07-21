import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import './LoginPage.css'

const LoginPage = () => {

  let {loginUser} = useContext(AuthContext)
  let navigate = useNavigate()

  const handleRegisterButtonClick = () => {
    navigate("/register"); // Navigate to registration page
  };

  return (
    <div className="login-form-container">
      <h2>Login</h2>
      <form onSubmit={loginUser}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            placeholder="username"
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            placeholder="password"
            required
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <button className="register-button" onClick={handleRegisterButtonClick}>
        Register
      </button>
    </div>
  );
}

export default LoginPage
