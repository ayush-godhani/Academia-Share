// frontend/src/components/Header.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header>
      <div className="container">
        <div className="logo">
          <h1><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>ACADEMIA SHARE</Link></h1>
        </div>
        <nav>
          <ul className={mobileOpen ? 'mobile-open' : ''}>
            <li><Link to="/" className={isActive('/')} onClick={() => setMobileOpen(false)}>Home</Link></li>
            <li><Link to="/browse" className={isActive('/browse')} onClick={() => setMobileOpen(false)}>Browse</Link></li>
            <li><Link to="/upload" className={isActive('/upload')} onClick={() => setMobileOpen(false)}>Upload</Link></li>
            <li><Link to="/noticeboard" className={isActive('/noticeboard')} onClick={() => setMobileOpen(false)}>Notice Board</Link></li>
            {currentUser ? (
              <>
                <li><Link to="/profile" className={isActive('/profile')} onClick={() => setMobileOpen(false)}>Profile</Link></li>
                <li><a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a></li>
              </>
            ) : (
              <>
                <li><Link to="/login" className={isActive('/login')} onClick={() => setMobileOpen(false)}>Login</Link></li>
                <li><Link to="/register" className={isActive('/register')} onClick={() => setMobileOpen(false)}>Register</Link></li>
              </>
            )}
          </ul>
        </nav>
        <button
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen(o => !o)}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
};

export default Header;