import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Hook for navigating to another page

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', new URLSearchParams({ username, password }));

      if (response.status === 200) {
        console.log(response)
        // Redirect to profile page if login is successful
        navigate(`/dashboard/${response.data.id}`);  // Redirecting to profile page (e.g., /profile/123)
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" onClick={handleLogin}>
          Login
        </button>
        <button type="button" onClick={() => {navigate(`/register`)}}>
          Register
        </button>
      </form>
    </div>
  );
};

export default Login;
