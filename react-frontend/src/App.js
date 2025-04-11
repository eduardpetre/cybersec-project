import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import React Router components
import Register from './components/Register';  // Assuming Login is a component you already have
import Login from './components/Login';  // Assuming Login is a component you already have
import Profile from './components/Profile';  // Create a Profile component to render after login
import Dashboard from './components/Dashboard';  // Assuming Dashboard is a component you already have
import Admin from './components/Admin';  // Assuming Admin is a component you already have

const App = () => {
  return (
    <Router>  {/* Wrap your app in Router */}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/upload" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
