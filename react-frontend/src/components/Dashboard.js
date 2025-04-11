import React, {useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useParams hook to access route parameters
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();  // Hook for navigating to another page

  const { id } = useParams(); // Retrieve the userId from the URL paramete
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    axios.get(`http://localhost:5000/dashboard/${id}`)
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    if (user) { // Ensure user data is available before accessing properties
      const idParagraph = document.getElementById('id');
      idParagraph.innerHTML = `User ID: ${user.id}`; // Display the user ID in the paragraph element

      const usernameParagraph = document.getElementById('username');
      usernameParagraph.innerHTML = `Hello, ${user.username}!`; // Display the username in the paragraph element
    }
  }, [user]); // Re-run effect when user data changes

  return (
    <div>
      <h2>Dashboard</h2>
      <p id="id"></p>  {/* Display the user ID */}
      <p id="username"></p> {/* Display the username */}
      <button type="button" onClick={() => navigate(`/profile/${user.id}`)}>
          See profile
      </button>
    </div>
  );
};

export default Dashboard;
