import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Hook for navigating to another page

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', new URLSearchParams({ username, password }));
      console.log(response)

      if (response.status === 200) {
        // Redirect to profile page if login is successful
        navigate(`/dashboard/${response.data.id}`);  // Redirecting to profile page (e.g., /profile/123)
      }
    } catch (error) {
      console.error('Register failed:', error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
        <button type="button" onClick={handleRegister}>
          Register
        </button>
        <button type="button" onClick={() => {navigate(`/login`)}}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Register;
