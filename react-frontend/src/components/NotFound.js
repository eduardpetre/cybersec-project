import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotFound = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('http://localhost:5000/dashboard', {
          withCredentials: true
        });
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleNavigation = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  // Styles
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
      maxWidth: '600px',
      textAlign: 'center',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '30px',
      color: '#333',
    },
    text: {
      fontSize: '18px',
      margin: '15px 0',
      color: '#555',
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'background-color 0.3s',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>404 - Page Not Found</h2>
        <p style={styles.text}>
          The page you are looking for doesn't exist or you don't have permission to access it.
        </p>
        <button
          style={styles.button}
          onClick={handleNavigation}
        >
          Return to {isAuthenticated ? 'Dashboard' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default NotFound; 