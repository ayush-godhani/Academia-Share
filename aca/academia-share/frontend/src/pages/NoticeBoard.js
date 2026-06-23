// frontend/src/pages/NoticeBoard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import NoticeCard from '../components/NoticeCard';

const CATEGORIES = ['general', 'exam', 'event', 'holiday', 'result'];

const NoticeBoard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const [form, setForm] = useState({
    title: '', content: '', category: 'general', important: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices');
      setNotices(res.data.notices || []);
    } catch (err) {
      console.error('fetchNotices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.content.trim()) errs.content = 'Content is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!currentUser) { navigate('/login?redirect=/noticeboard'); return; }
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await api.post('/notices', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(prev => [res.data.notice, ...prev]);
      setForm({ title: '', content: '', category: 'general', important: false });
      setShowForm(false);
      alert('Notice posted successfully!');
    } catch (err) {
      alert('Failed to post notice: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const token = await currentUser.getIdToken();
      await api.delete(`/notices/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      alert('Failed to delete notice: ' + (err.response?.data?.error || err.message));
    }
  };

  const filtered = filterCategory === 'all' ? notices : notices.filter(n => n.category === filterCategory);

  return (
    <>
      {/* Hero */}
      <section className="auth-hero">
        <div className="container">
          <h2>📋 Notice Board</h2>
          <p>Stay updated with the latest announcements, exam schedules, and events</p>
        </div>
      </section>

      {/* Notice Board Content */}
      <section className="upload-form-section">
        <div className="container">

          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            {/* Category Filter */}
            <div className="filters" style={{ justifyContent: 'flex-start' }}>
              <div className="filter-group">
                <label htmlFor="categoryFilter">Filter by Category:</label>
                <select id="categoryFilter" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Post Notice Button */}
            {currentUser ? (
              <button className="cta-button" onClick={() => setShowForm(s => !s)}>
                {showForm ? '✕ Cancel' : '+ Post a Notice'}
              </button>
            ) : (
              <button className="cta-button secondary" onClick={() => navigate('/login?redirect=/noticeboard')}>
                Login to Post a Notice
              </button>
            )}
          </div>

          {/* Post Notice Form */}
          {showForm && currentUser && (
            <div style={{ background: 'var(--white)', padding: '2rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-lg)', marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Post a New Notice</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="noticeTitle">Notice Title *</label>
                  <input type="text" id="noticeTitle" name="title" placeholder="e.g., Mid-Semester Exam Schedule"
                    value={form.title} onChange={handleChange} />
                  {formErrors.title && <div className="field-error">{formErrors.title}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="noticeContent">Notice Content *</label>
                  <textarea id="noticeContent" name="content" rows="4"
                    placeholder="Write the full notice here..."
                    value={form.content} onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--medium-gray)', borderRadius: 'var(--border-radius)', fontSize: '1rem', resize: 'vertical' }}
                  />
                  {formErrors.content && <div className="field-error">{formErrors.content}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="noticeCategory">Category</label>
                    <select id="noticeCategory" name="category" value={form.category} onChange={handleChange}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--medium-gray)', borderRadius: 'var(--border-radius)', fontSize: '1rem' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.8rem' }}>
                    <input type="checkbox" id="noticeImportant" name="important" checked={form.important} onChange={handleChange} style={{ width: 'auto' }} />
                    <label htmlFor="noticeImportant" style={{ fontWeight: 600, color: '#ef4444', margin: 0 }}>🔴 Mark as Important</label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cta-button secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="cta-button" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post Notice'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notices Grid */}
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--medium-gray)', padding: '3rem' }}>Loading notices...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--medium-gray)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</p>
              <p>No notices found{filterCategory !== 'all' ? ` in "${filterCategory}" category` : ''}.</p>
              {currentUser && <p style={{ marginTop: '0.5rem' }}>Be the first to post one!</p>}
            </div>
          ) : (
            <div className="documents-grid">
              {filtered.map(notice => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  canDelete={currentUser?.uid === notice.postedById}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default NoticeBoard;