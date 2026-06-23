// frontend/src/components/NoticeCard.js
import React from 'react';
import { timeAgo } from '../utils/helpers';

const CATEGORY_COLORS = {
  general: 'var(--primary-blue)',
  exam: '#ef4444',
  event: '#10b981',
  holiday: '#f59e0b',
  result: '#8b5cf6',
};

const NoticeCard = ({ notice, onDelete, canDelete }) => {
  return (
    <div
      className="document-card"
      style={{
        borderLeftColor: notice.important ? '#ef4444' : CATEGORY_COLORS[notice.category] || 'var(--primary-blue)',
        borderLeftWidth: notice.important ? '6px' : '4px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>
          {notice.important && <span style={{ color: '#ef4444', marginRight: '0.4rem' }}>🔴</span>}
          {notice.title}
        </h3>
        {canDelete && (
          <button
            onClick={() => onDelete(notice.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medium-gray)', fontSize: '1.1rem', padding: '0.25rem' }}
            title="Delete notice"
          >✕</button>
        )}
      </div>
      <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{notice.content}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--medium-gray)' }}>
        <span
          style={{
            background: CATEGORY_COLORS[notice.category] || 'var(--primary-blue)',
            color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'capitalize',
          }}
        >{notice.category}</span>
        <span>By {notice.postedByName} ({notice.postedByRole})</span>
        <span>{timeAgo(notice.createdAt)}</span>
      </div>
    </div>
  );
};

export default NoticeCard;