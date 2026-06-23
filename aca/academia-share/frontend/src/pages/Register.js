// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, calculatePasswordStrength } from '../utils/helpers';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', userType: '',
    institution: '', password: '', confirmPassword: '',
    agreeTerms: false, newsletter: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [pwStrength, setPwStrength] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(f => ({ ...f, [name]: val }));
    if (name === 'password') setPwStrength(value ? calculatePasswordStrength(value) : null);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!isValidEmail(form.email)) errs.email = 'Please enter a valid email address';
    if (!form.userType) errs.userType = 'Please select your role';
    if (!form.institution.trim()) errs.institution = 'Institution is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.agreeTerms) errs.agreeTerms = 'You must agree to the Terms of Service';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        userType: form.userType,
        institution: form.institution.trim(),
        newsletter: form.newsletter,
      });
      alert('Account created successfully! Welcome to Academia Share.');
      navigate('/');
    } catch (err) {
      const code = err.code || '';
      if (code.includes('email-already-in-use')) {
        setErrors({ email: 'Email already registered. Try logging in.' });
      } else {
        alert('Registration failed: ' + (err.message || 'Unknown error'));
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
          <h2>Join Our Community</h2>
          <p>Create your account and start sharing knowledge with students and faculty</p>
        </div>
      </section>

      {/* Register Form */}
      <section className="auth-section">
        <div className="container">
          <div className="auth-container">
            <div className="auth-form-container">
              <form id="registerForm" className="auth-form" onSubmit={handleSubmit}>
                <div className="form-header">
                  <h3>Create Your Account</h3>
                  <p>Fill in your details to get started</p>
                </div>

                {/* Social Register */}
                <div className="social-login">
                  <button type="button" className="social-btn google-btn" onClick={() => alert('Google registration would be implemented here')}>
                    <span className="social-icon">🔍</span> Sign up with Google
                  </button>
                  <button type="button" className="social-btn github-btn" onClick={() => alert('GitHub registration would be implemented here')}>
                    <span className="social-icon">💻</span> Sign up with GitHub
                  </button>
                </div>

                <div className="divider"><span>or sign up with email</span></div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input type="text" id="firstName" name="firstName" placeholder="John"
                      value={form.firstName} onChange={handleChange} />
                    {errors.firstName && <div className="field-error">{errors.firstName}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input type="text" id="lastName" name="lastName" placeholder="Doe"
                      value={form.lastName} onChange={handleChange} />
                    {errors.lastName && <div className="field-error">{errors.lastName}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input type="email" id="email" name="email" placeholder="your.email@example.com"
                    value={form.email} onChange={handleChange} />
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="userType">I am a *</label>
                  <select id="userType" name="userType" value={form.userType} onChange={handleChange}>
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="researcher">Researcher</option>
                  </select>
                  {errors.userType && <div className="field-error">{errors.userType}</div>}
                </div>

                <div className="form-group" id="institutionGroup">
                  <label htmlFor="institution">{form.userType === 'student' ? 'University/College' : 'Institution'} *</label>
                  <input type="text" id="institution" name="institution" placeholder="Your university or college"
                    value={form.institution} onChange={handleChange} />
                  {errors.institution && <div className="field-error">{errors.institution}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input type="password" id="password" name="password" placeholder="Create a strong password"
                    value={form.password} onChange={handleChange} />
                  {pwStrength && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div className="strength-fill" style={{ width: pwStrength.width, backgroundColor: pwStrength.color }} />
                      </div>
                      <span className="strength-text" style={{ color: pwStrength.color }}>{pwStrength.text}</span>
                    </div>
                  )}
                  {errors.password && <div className="field-error">{errors.password}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Repeat your password"
                    value={form.confirmPassword} onChange={handleChange} />
                  {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                </div>

                <div className="form-group checkbox-group">
                  <input type="checkbox" id="agreeTerms" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange} />
                  <label htmlFor="agreeTerms">I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></label>
                </div>
                {errors.agreeTerms && <div className="field-error">{errors.agreeTerms}</div>}

                <div className="form-group checkbox-group">
                  <input type="checkbox" id="newsletter" name="newsletter" checked={form.newsletter} onChange={handleChange} />
                  <label htmlFor="newsletter">Send me updates about new features and resources (optional)</label>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="auth-footer">
                  <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="auth-sidebar">
              <h3>Why Join ACADEMIA SHARE?</h3>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">📖</span>
                  <div className="benefit-content"><h4>Access Thousands of Documents</h4><p>Get instant access to notes, lab manuals, and study materials</p></div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🤝</span>
                  <div className="benefit-content"><h4>Collaborate with Peers</h4><p>Connect with students and faculty from various institutions</p></div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🚀</span>
                  <div className="benefit-content"><h4>Accelerate Learning</h4><p>Find resources faster and focus on what matters</p></div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🏆</span>
                  <div className="benefit-content"><h4>Build Your Reputation</h4><p>Gain recognition for your contributions to the community</p></div>
                </div>
              </div>
              <div className="community-stats">
                <h4>Our Growing Community</h4>
                <div className="stats-grid">
                  <div className="stat-item"><span className="stat-number">5,000+</span><span className="stat-label">Members</span></div>
                  <div className="stat-item"><span className="stat-number">10,000+</span><span className="stat-label">Documents</span></div>
                  <div className="stat-item"><span className="stat-number">8</span><span className="stat-label">Semesters</span></div>
                  <div className="stat-item"><span className="stat-number">40+</span><span className="stat-label">Subjects</span></div>
                </div>
              </div>
              <div className="testimonial">
                <div className="testimonial-content">"ACADEMIA SHARE helped me find exactly what I needed for my final year project. The community is amazing!"</div>
                <div className="testimonial-author"><strong>Sarah Chen</strong><span>Computer Engineering Student</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;