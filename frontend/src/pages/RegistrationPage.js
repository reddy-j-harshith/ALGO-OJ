import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext'
import './RegistrationPage.css'; 

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  let navigate = useNavigate();
  let { logoutUser } = useContext(AuthContext);
  let { authTokens } = useContext(AuthContext);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    try {
        e.preventDefault();
      let response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        console.log('Registration successful');
        if (authTokens) {
          logoutUser();
        }
        navigate('/login');
      }
      console.log(formData);
    } catch (error) {
      console.error("Registration failed:", error.response.data);
      setError("your credentials are not unique");
    }
  };

  const handleLoginButtonClick = () => {
    navigate("/"); // Navigate to login page
  };
  
  return (
    <div className="registration-form-container">
    <h2>User Registration</h2>
    {error && <p className="error-message">{error}</p>} {/* Display error message */}
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </label>
      <button type="submit">Register</button>
    </form>
    <button className="go-to-login-button" onClick={handleLoginButtonClick}>Go to Login Page</button>
  </div>
);
};

export default RegistrationPage;
