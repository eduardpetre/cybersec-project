import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile'; 
import Dashboard from './components/Dashboard';
import Admin from './components/Admin'; 
import NotFound from './components/NotFound';
import AuthChecker from './AuthChecker';

const App = () => {
  return (
    <Router>  
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<AuthChecker><Login /></AuthChecker>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/upload" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
