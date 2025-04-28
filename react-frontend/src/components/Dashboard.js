import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser.id;

        if (!userId) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/dashboard', {
          withCredentials: true
        });

        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleRedirect = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    }
  };

  const dashboardMessage = useRef(null);
  useEffect(() => {
    if (dashboardMessage.current) {
      dashboardMessage.current.innerHTML = "Hello," + user?.name + "!";
    }
  }, [user]);

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
    loading: {
      fontSize: '18px',
      color: '#666',
    },
    error: {
      fontSize: '18px',
      color: '#d32f2f',
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.loading}>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.error}>{error}</p>
          <button style={styles.button} onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Dashboard</h2>

        {user && (
          <>
            <p style={styles.text}>User ID: {user.id}</p>
            <p ref={dashboardMessage} style={styles.text}></p>

            <input
              type="hidden"
              id="input"
              value={`/profile/${user.id}`}
            />

            <button
              style={styles.button}
              onClick={handleRedirect}
            >
              View Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
