import React from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid #eee',
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#333',
    },
    content: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      padding: '30px',
      flex: 1,
    },
    cardContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '20px',
      marginTop: '20px',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      transition: 'transform 0.2s',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-5px)',
      },
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#444',
    },
    cardText: {
      color: '#666',
      fontSize: '14px',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#45a049',
      },
    },
    logoutButton: {
      ...this?.button, // This won't work - see note below
      backgroundColor: '#f44336',
      '&:hover': {
        backgroundColor: '#d32f2f',
      },
    },
  };

  // Note: The hover effects in the style object won't work with inline styles
  // In a real project, consider using CSS classes or styled-components

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  const adminCards = [
    { title: 'Users', description: 'Manage system users', action: () => navigate('/admin/users') },
    { title: 'Settings', description: 'System configuration', action: () => navigate('/admin/settings') },
    { title: 'Reports', description: 'View system reports', action: () => navigate('/admin/reports') },
    { title: 'Analytics', description: 'View system metrics', action: () => navigate('/admin/analytics') },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <button 
          style={{ 
            ...styles.button, 
            backgroundColor: '#f44336',
            ':hover': { backgroundColor: '#d32f2f' } // This won't work with inline styles
          }} 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div style={styles.content}>
        <p>Welcome back, Admin! Here's what's happening today.</p>
        
        <div style={styles.cardContainer}>
          {adminCards.map((card, index) => (
            <div 
              key={index} 
              style={styles.card}
              onClick={card.action}
            >
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardText}>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;