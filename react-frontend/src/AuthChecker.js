import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthChecker = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (currentUser.id && window.location.pathname === '/login') {
        navigate('/dashboard');
      }
      else if (!currentUser.id && window.location.pathname !== '/login') {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return children;
};

export default AuthChecker;