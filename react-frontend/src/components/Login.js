import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('sessionId');
    
    if (sessionId) {
      document.cookie = `sessionId=${sessionId}; path=/`;
      console.log(`Using provided session ID: ${sessionId}`);
    } else if (!getSessionId()) {
      const newSessionId = generateSessionId();
      document.cookie = `sessionId=${newSessionId}; path=/`;
      console.log(`Generated new session ID: ${newSessionId}`);
    }
  }, [location]);

  const getSessionId = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'sessionId') {
        return value;
      }
    }
    return null;
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const sessionId = getSessionId();
      
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('sessionId', sessionId); 
      
      const response = await axios.post('http://localhost:5000/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      });

      if (response.status === 200 || response.status === 302) {
        localStorage.setItem('currentUser', JSON.stringify({
          id: response.data?.id || 'unknown',
          username: username,
          sessionId: 'cookie-based'
        }));

        if (response.data?.redirect) {
          navigate(response.data.redirect);
        } else if (username === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:5000/check-auth', {
          withCredentials: true
        });
        if (response.data.authenticated) {
          const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (userData.username === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      width: '100%',
      maxWidth: '400px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '30px',
      color: '#333',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '20px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      marginBottom: '10px',
      transition: 'background-color 0.3s',
    },
    buttonSecondary: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#f5f5f5',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      marginBottom: '10px',
      transition: 'background-color 0.3s',
    },
    error: {
      color: '#d32f2f',
      marginBottom: '20px',
      textAlign: 'center',
    },
    loading: {
      textAlign: 'center',
      margin: '10px 0',
    },
    sessionInfo: {
      fontSize: '12px',
      color: '#999',
      textAlign: 'center',
      marginTop: '20px',
      padding: '10px',
      backgroundColor: '#f9f9f9',
      borderRadius: '4px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        
        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        <button
          style={styles.buttonSecondary}
          onClick={() => navigate('/register')}
          disabled={isLoading}
        >
          Register
        </button>
        
        {isLoading && <div style={styles.loading}>Please wait...</div>}
        
        <div style={styles.sessionInfo}>
          Current Session ID: {getSessionId() || 'None'}
          <br />
          <small>Note: Actual authentication now uses secure HTTP-only cookies</small>
        </div>
      </div>
    </div>
  );
};

export default Login;