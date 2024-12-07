import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Navigation Component - Main navigation bar for the Harmony application
 * 
 * Features:
 * - Responsive navigation using DaisyUI navbar component
 * - Dynamic rendering based on authentication state
 * - Consistent styling with main application theme
 * 
 * Styling Notes:
 * - Uses DaisyUI navbar component
 * - Implements consistent button styling
 * - Maintains responsive design
 */
const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="navbar bg-base-100 shadow-xl">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl text-primary">
          Harmony
        </Link>
      </div>
      
      <div className="navbar-end">
        {isLoggedIn ? (
          <div className="flex gap-4">
            <Link to="/studio" className="btn btn-ghost btn-sm">
              My Studio
            </Link>
            <button onClick={handleLogout} className="btn btn-error btn-sm">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;

/**
 * Usage Notes:
 * - Component automatically updates based on authentication state
 * - Uses consistent DaisyUI button styling
 * - Maintains responsive design across screen sizes
 * 
 * Development Tips:
 * - Button styles can be customized in tailwind.config.js
 * - Authentication state is managed through localStorage
 */