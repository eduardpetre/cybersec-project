import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import axios from 'axios';

const Profile = () => {
  const { id } = useParams(); 

  // Local state for new password and picture file
  const [newPassword, setNewPassword] = useState('');
  const [picture, setPicture] = useState(null);
  const [message, setMessage] = useState('');
  const [profilePic, setProfilePic] = useState(''); // State for profile picture URL

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/profile/${id}`);

        // Set the profile picture if it exists
        if (response.data.profile_pic) {
          setProfilePic(`http://localhost:5000/uploads/${response.data.profile_pic}`);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [id]);

  // Handle file selection
  const handleFileChange = (e) => {
    setPicture(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('id', id);

    if (newPassword) {
      formData.append('new_password', newPassword);
      // document.cookie = `password=${newPassword}; path=/;`; // Set the new password in a cookie
    }

    if (picture) {
      formData.append('picture', picture);
    }

    try {
      const response = await axios.post('http://localhost:5000/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage(response.data.message);

      if (response.status === 200) {
        // Re-fetch the updated profile
        const updatedResponse = await axios.get(`http://localhost:5000/profile/${id}`);

        if (updatedResponse.data.profile_pic) {
          setProfilePic(`http://localhost:5000/uploads/${updatedResponse.data.profile_pic}`);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    }
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      {profilePic && <img src={profilePic} alt="Profile" width="150" height="150" />}
      <form onSubmit={handleSubmit}>
        <div>
          <label>New Password: </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label>Profile Picture: </label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit">Update Profile</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Profile;
