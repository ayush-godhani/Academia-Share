// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/helpers';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!isValidEmail(form.email)) errs.email = 'Please enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(redirect);
    } catch (err) {
      const code = err.code || '';
      if (code.includes('user-not-found') || code.includes('invalid-credential')) {
        setErrors({ email: 'No account found with this email. Please register first.' });
      } else if (code.includes('wrong-password')) {
        setErrors({ password: 'Incorrect password. Please try again.' });
      } else {
        setErrors({ password: err.message || 'Login failed. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Auth Hero */}
      <section className="auth-hero">
        <div className="container">
          <h2>Welcome Back</h2>
          <p>Login to access your documents and continue sharing knowledge</p>
        </div>
      </section>

      {/* Login Form */}
      <section className="auth-section">
        <div className="container">
          <div className="auth-container">
            <div className="auth-form-container">
              <form id="loginForm" className="auth-form" onSubmit={handleSubmit}>
                <div className="form-header">
                  <h3>Login to Your Account</h3>
                  <p>Enter your credentials to continue</p>
                </div>

                {/* Social Login */}
                <div className="social-login">
                  <button type="button" className="social-btn google-btn" onClick={() => alert('Google login would be implemented here')}>
                    <span className="social-icon">🔍</span> Continue with Google
                  </button>
                  <button type="button" className="social-btn github-btn" onClick={() => alert('GitHub login would be implemented here')}>
                    <span className="social-icon">💻</span> Continue with GitHub
                  </button>
                </div>

                <div className="divider"><span>or login with email</span></div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input type="email" id="email" name="email" placeholder="your.email@example.com"
                    value={form.email} onChange={handleChange} />
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input type="password" id="password" name="password" placeholder="Enter your password"
                    value={form.password} onChange={handleChange} />
                  {errors.password && <div className="field-error">{errors.password}</div>}
                  <div className="password-options">
                    <label className="remember-me">
                      <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
                      Remember me
                    </label>
                    <a href="#forgot" className="forgot-password" onClick={e => { e.preventDefault(); alert('Forgot password feature coming soon!'); }}>
                      Forgot Password?
                    </a>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={submitting}>
                  {submitting ? 'Logging in...' : 'Login to Account'}
                </button>

                <div className="auth-footer">
                  <p>Don't have an account? <Link to="/register">Create one here</Link></p>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="auth-sidebar">
              <h3>Welcome Back to ACADEMIA SHARE</h3>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">📚</span>
                  <div className="benefit-content"><h4>Access Your Documents</h4><p>View your uploaded materials and favorites</p></div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⬆️</span>
                  <div className="benefit-content"><h4>Share Knowledge</h4><p>Upload new documents and help others</p></div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">👥</span>
                  <div className="benefit-content"><h4>Join Community</h4><p>Connect with students and faculty</p></div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🔔</span>
                  <div className="benefit-content"><h4>Stay Updated</h4><p>Get notifications on new resources</p></div>
                </div>
              </div>
              <div className="stats-preview">
                <div className="stat-preview"><span className="stat-number">5,000+</span><span className="stat-label">Active Members</span></div>
                <div className="stat-preview"><span className="stat-number">10,000+</span><span className="stat-label">Documents Shared</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;