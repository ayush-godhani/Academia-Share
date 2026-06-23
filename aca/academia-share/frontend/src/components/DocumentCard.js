import React from 'react';
import { timeAgo, formatFileSize, getFileIcon, SUBJECT_LABELS } from '../utils/helpers';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DocumentCard = ({ doc, showDownload = true }) => {
  const { currentUser } = useAuth();

  const handleDownload = () => {
    if (!doc.fileUrl) return alert('File not available');

    window.open(doc.fileUrl, '_blank');

    api.patch(`/documents/${doc.id}/download`).catch(() => {});
  };

  const handleDelete = async () => {
  if (!window.confirm('Delete this document?')) return;
  try {
    await api.delete(`/documents/${doc.id}`);
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || err.message);
  }
};

  return (
    <div className="document-card">
      <div className="document-preview">
        <span className="file-type">{doc.fileType || 'FILE'}</span>
      </div>

      <h3>{doc.title}</h3>
      <p>{doc.description || 'No description provided.'}</p>

      <div className="document-meta">
        <span>Sem {doc.semester}</span>
        <span>{SUBJECT_LABELS[doc.subject] || doc.subject}</span>
      </div>

      <div className="document-stats">
        <span>👁 {doc.viewCount || 0} views</span>
        <span>⬇ {doc.downloadCount || 0} downloads</span>
      </div>

      <div className="document-meta">
        <span>{getFileIcon(doc.fileType)} {formatFileSize(doc.fileSize)}</span>
        <span>{timeAgo(doc.createdAt)}</span>
      </div>

      <small style={{ color: 'var(--medium-gray)' }}>
        By {doc.uploaderName}
      </small>

      {showDownload && (
        <button className="download-btn" onClick={handleDownload}>
          ⬇ Download
        </button>
      )}

      {currentUser && doc.uploaderId === currentUser.uid && (
        <button
          onClick={handleDelete}
          style={{
            marginTop: '8px',
            background: 'red',
            color: 'white',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          🗑 Delete
        </button>
      )}
    </div>
  );
};

export default DocumentCard;