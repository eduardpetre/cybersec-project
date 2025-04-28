import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    newPassword: '',
    picture: null
  });
  const [profilePic, setProfilePic] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser.id;

        const response = await axios.get(`http://localhost:5000/profile/${userId}`, {
          withCredentials: true 
        });

        if (response.status === 200) {
          setUser(response.data);
          if (response.data.profile_pic) {
            setProfilePic(`http://localhost:5000/uploads/${response.data.profile_pic}`);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setMessage({ text: 'Error loading profile', type: 'error' });
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'picture' && files && files[0]) {
      const file = files[0];
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      setFileError(!validImageTypes.includes(file.type));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    if (!user) {
      setMessage({ text: 'User data not available', type: 'error' });
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append('id', user.id);
    if (formData.newPassword) data.append('new_password', formData.newPassword);
    if (formData.name) data.append('name', formData.name);
    if (formData.picture) data.append('picture', formData.picture);

    try {
      const response = await axios.post('http://localhost:5000/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true // Enable sending/receiving cookies
      });

      setMessage({ text: response.data.message, type: 'success' });

      if (formData.picture) {
        const updated = await axios.get(`http://localhost:5000/profile/${user.id}`, {
          withCredentials: true
        });
        if (updated.data.profile_pic) {
          setProfilePic(`http://localhost:5000/uploads/${updated.data.profile_pic}?${Date.now()}`);
        }
      }
      
      setFormData(prev => ({ ...prev, newPassword: '', name: '' }));
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        navigate('/login');
      } else {
        setMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
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
      maxWidth: '500px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '30px',
      color: '#333',
      textAlign: 'center',
    },
    avatarContainer: {
      position: 'relative',
      width: '150px',
      height: '150px',
      margin: '0 auto 20px',
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #4CAF50',
    },
    filePreview: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e9ecef',
      border: '3px solid #6c757d',
      color: '#495057',
      textAlign: 'center',
      padding: '10px',
      fontSize: '14px',
      overflow: 'hidden',
    },
    fileName: {
      fontWeight: 'bold',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
      marginBottom: '5px',
    },
    fileType: {
      fontSize: '12px',
      color: '#6c757d',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#555',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box',
    },
    fileInput: {
      width: '100%',
      padding: '10px 0',
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
      marginTop: '10px',
      transition: 'background-color 0.3s',
    },
    message: {
      padding: '10px',
      borderRadius: '4px',
      margin: '20px 0',
      textAlign: 'center',
    },
    success: {
      backgroundColor: '#dff0d8',
      color: '#3c763d',
    },
    error: {
      backgroundColor: '#f2dede',
      color: '#a94442',
    },
    backButton: {
      backgroundColor: '#6c757d',
      marginTop: '20px',
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed',
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      cpp: 'C++',
      js: 'JS',
      py: 'Py',
      java: 'Java',
      html: 'HTML',
      css: 'CSS',
    };
    return icons[ext] || ext.toUpperCase();
  };

  const filePreviewStyle = {
    ...styles.filePreview,
    border: fileError ? '3px solid #dc3545' : styles.filePreview.border,
    color: fileError ? '#dc3545' : styles.filePreview.color,
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Edit Profile</h2>

        <div style={styles.avatarContainer}>
          {selectedFile ? (
            <div style={filePreviewStyle}>
              <div style={{ textAlign: 'center' }}>
                <div style={styles.fileName}>{selectedFile.name}</div>
                <div style={styles.fileType}>
                  {fileError ? '❌ Invalid file type (only images allowed)' : `${getFileIcon(selectedFile.name)} File`}
                </div>
                <div style={{ fontSize: '28px', marginTop: '10px' }}>📄</div>
              </div>
            </div>
          ) : profilePic ? (
            <img 
              src={profilePic} 
              alt="Profile" 
              style={styles.avatar}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          ) : (
            <div style={styles.filePreview}>
              <div>No file selected</div>
              <div style={{ fontSize: '24px', marginTop: '5px' }}>👤</div>
            </div>
          )}
        </div>

        {message.text && (
          <div style={{ ...styles.message, ...styles[message.type] }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name:</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              value={formData.name || user?.name || ''}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>New Password:</label>
            <input
              style={styles.input}
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Profile Picture:</label>
            <input 
              style={styles.fileInput}
              type="file" 
              name="picture"
              onChange={handleChange}
            />
          </div>

          <button 
            style={{
              ...styles.button,
              ...(isLoading ? styles.disabledButton : {})
            }} 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Save changes'}
          </button>
        </form>

        <button 
          style={{ ...styles.button, ...styles.backButton }}
          onClick={() => navigate(-1)}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Profile;
