// frontend/src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { timeAgo } from '../utils/helpers';

const Home = () => {
  const [recentDocs, setRecentDocs] = useState([]);
  const [popularDocs, setPopularDocs] = useState([]);

  useEffect(() => {
    api.get('/documents/recent').then(r => setRecentDocs(r.data.documents || [])).catch(() => {});
    api.get('/documents/popular').then(r => setPopularDocs(r.data.documents || [])).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Share Knowledge. Grow Together.</h2>
          <p>Your premier platform for sharing and discovering engineering documents across all semesters and subjects.</p>
          <Link to="/register" className="cta-button">Get Started</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step"><span className="step-number">1</span><h3>Create Account</h3><p>Register as student or faculty</p></div>
            <div className="step"><span className="step-number">2</span><h3>Browse or Upload</h3><p>Find materials or share your own</p></div>
            <div className="step"><span className="step-number">3</span><h3>Organize by Semester</h3><p>Filter by semester and subject</p></div>
            <div className="step"><span className="step-number">4</span><h3>Collaborate</h3><p>Learn and share with peers</p></div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics">
        <div className="container">
          <h2>Platform Statistics</h2>
          <div className="stats-grid">
            <div className="stat"><span className="stat-number">10,000+</span><p>Documents Shared</p></div>
            <div className="stat"><span className="stat-number">5,000+</span><p>Active Users</p></div>
            <div className="stat"><span className="stat-number">8</span><p>Semesters</p></div>
            <div className="stat"><span className="stat-number">40+</span><p>Subjects</p></div>
          </div>
        </div>
      </section>

      {/* Recent Uploads */}
      <section className="recent-uploads">
        <div className="container">
          <h2>Recent Uploads</h2>
          <div className="uploads-grid">
            {recentDocs.length > 0 ? recentDocs.map(doc => (
              <div key={doc.id} className="document-card">
                <h3>{doc.title}</h3>
                <p>Semester {doc.semester} - {doc.subjectLabel || doc.subject}</p>
                <span className="upload-time">{timeAgo(doc.createdAt)}</span>
              </div>
            )) : (
              <>
                <div className="document-card"><h3>Data Structures Notes</h3><p>Semester 3 - Computer Science</p><span className="upload-time">2 hours ago</span></div>
                <div className="document-card"><h3>Thermodynamics Lab Manual</h3><p>Semester 4 - Mechanical</p><span className="upload-time">5 hours ago</span></div>
                <div className="document-card"><h3>Circuit Theory Problems</h3><p>Semester 2 - Electrical</p><span className="upload-time">1 day ago</span></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Popular Documents */}
      <section className="popular-documents">
        <div className="container">
          <h2>Most Viewed Documents</h2>
          <div className="documents-grid">
            {popularDocs.length > 0 ? popularDocs.map(doc => (
              <div key={doc.id} className="document-card">
                <h3>{doc.title}</h3>
                <p>Semester {doc.semester} - {doc.subjectLabel || doc.subject}</p>
                <span className="view-count">{doc.viewCount || 0} views</span>
              </div>
            )) : (
              <>
                <div className="document-card"><h3>Complete Engineering Mathematics</h3><p>Semester 1 - Common</p><span className="view-count">1,245 views</span></div>
                <div className="document-card"><h3>OOPS Programming Guide</h3><p>Semester 3 - IT</p><span className="view-count">987 views</span></div>
                <div className="document-card"><h3>Mechanical Workshop Practice</h3><p>Semester 2 - Mechanical</p><span className="view-count">856 views</span></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Categories by Semester */}
      <section className="categories">
        <div className="container">
          <h2>Browse by Semester</h2>
          <div className="categories-grid">
            <div className="category-card">
              <h3>Semester 1</h3>
              <ul><li>Mathematics-I</li><li>Physics</li><li>Programming</li><li>Chemistry</li><li>English</li></ul>
            </div>
            <div className="category-card">
              <h3>Semester 2</h3>
              <ul><li>Mathematics-II</li><li>Engineering Drawing</li><li>Basic Electronics</li><li>Environmental Science</li><li>Workshop Practice</li></ul>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/browse" className="cta-button secondary">View All Semesters</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;