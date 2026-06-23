// frontend/src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer>
    <div className="container">
      <div className="footer-content">
        <div className="footer-section">
          <h3>ACADEMIA SHARE</h3>
          <p>Connecting students and faculty through knowledge sharing</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/browse">Browse</Link></li>
            <li><Link to="/upload">Upload</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/noticeboard">Notice Board</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@academiashare.com</p>
          <p>Phone: +1 234 567 890</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 ACADEMIA SHARE. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;