// src/pages/Login.js - Login page where user can sign in

import React, { useState } from 'react';
import { signIn } from '../firebase/auth';  // Import the signIn function
import { useHistory } from 'react-router-dom'; // To navigate after successful login

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const history = useHistory();  // Use for redirection

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the signIn function with the email and password
      await signIn(email, password);
      // Redirect to the dashboard (or another page) after successful login
      history.push('/dashboard');
    } catch (err) {
      // Handle any errors (like wrong credentials)
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
