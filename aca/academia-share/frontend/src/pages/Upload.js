import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatFileSize, getFileIcon } from '../utils/helpers';

const Upload = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    documentTitle: '', documentDescription: '', semester: '',
    subject: '', documentType: 'notes', visibility: 'public',
    tags: '', agreeTerms: false, allowDownloads: true,
  });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFile = (f) => {
    if (!f) return;
    const allowed = [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    if (!allowed.includes(f.type)) { alert('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, TXT allowed.'); return; }
    if (f.size > 10* 1024 * 1024) { alert('File size must be less than 10MB'); return; }
    setFile(f);
  };

  const handleDrop = e => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const removeFile = () => {
    setFile(null); setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const errs = {};
    if (!form.documentTitle.trim()) errs.documentTitle = 'Document title is required';
    if (!form.semester) errs.semester = 'Please select a semester';
    if (!form.subject) errs.subject = 'Please select a subject';
    if (!file) errs.file = 'Please select a file to upload';
    if (!form.agreeTerms) errs.agreeTerms = 'Please agree to the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const uploadToCloudinaryDirect = async () => {
  return new Promise((resolve, reject) => {
    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', 'academia_upload');

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
xhr.onload = () => {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    
    // 👇 Paste the full output here
    console.log('FULL CLOUDINARY RESPONSE:', JSON.stringify(data, null, 2));
    
    resolve(data);
  } else {
    // 👇 Also log failures
    console.log('CLOUDINARY ERROR:', xhr.status, xhr.responseText);
    reject(new Error('Cloudinary upload failed: ' + xhr.responseText));
  }
};
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/dzxbs92b1/raw/upload');
    xhr.send(cloudFormData);
  });
};

  const handleSubmit = async e => {
    e.preventDefault();
    if (!currentUser) { navigate('/login?redirect=/upload'); return; }
    if (!validate()) return;

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const token = await currentUser.getIdToken();

      // Step 1: Upload file directly to Cloudinary
      const cloudData = await uploadToCloudinaryDirect(token);

      // Step 2: Save metadata to backend
      await api.post('/documents', {
        title: form.documentTitle,
        description: form.documentDescription,
        semester: form.semester,
        subject: form.subject,
        documentType: form.documentType,
        visibility: form.visibility,
        tags: form.tags,
        allowDownloads: form.allowDownloads,
        fileUrl: cloudData.secure_url,
        publicId: cloudData.public_id,
        fileSize: cloudData.bytes,
        format: cloudData.format,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Document uploaded successfully!');
      navigate('/browse');
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="upload-hero">
        <div className="container">
          <h2>Share Your Knowledge</h2>
          <p>Upload documents to help fellow students and contribute to the academic community</p>
        </div>
      </section>

      <section className="upload-form-section">
        <div className="container">
          <div className="upload-container">
            <form id="uploadForm" className="upload-form" onSubmit={handleSubmit}>

              <div className="form-section">
                <h3>Document Details</h3>
                <div className="form-group">
                  <label htmlFor="documentTitle">Document Title *</label>
                  <input type="text" id="documentTitle" name="documentTitle"
                    placeholder="e.g., Data Structures Complete Notes"
                    value={form.documentTitle} onChange={handleChange} />
                  {errors.documentTitle && <div className="field-error">{errors.documentTitle}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="documentDescription">Description</label>
                  <textarea id="documentDescription" name="documentDescription" rows="3"
                    placeholder="Brief description of the document content..."
                    value={form.documentDescription} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="semester">Semester *</label>
                    <select id="semester" name="semester" value={form.semester} onChange={handleChange}>
                      <option value="">Select Semester</option>
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={String(s)}>Semester {s}</option>
                      ))}
                    </select>
                    {errors.semester && <div className="field-error">{errors.semester}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
                      <option value="">Select Subject</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="physics">Physics</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="programming">Programming</option>
                      <option value="electronics">Electronics</option>
                      <option value="mechanical">Mechanical Engineering</option>
                      <option value="electrical">Electrical Engineering</option>
                      <option value="computer-science">Computer Science</option>
                      <option value="civil">Civil Engineering</option>
                      <option value="english">English</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && <div className="field-error">{errors.subject}</div>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="documentType">Document Type</label>
                    <select id="documentType" name="documentType" value={form.documentType} onChange={handleChange}>
                      <option value="notes">Class Notes</option>
                      <option value="lab-manual">Lab Manual</option>
                      <option value="assignment">Assignment</option>
                      <option value="project">Project</option>
                      <option value="question-paper">Question Paper</option>
                      <option value="solutions">Solutions</option>
                      <option value="presentation">Presentation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="visibility">Visibility</label>
                    <select id="visibility" name="visibility" value={form.visibility} onChange={handleChange}>
                      <option value="public">Public (Everyone)</option>
                      <option value="students">Students Only</option>
                      <option value="faculty">Faculty Only</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>File Upload</h3>
                <div
                  className={`file-upload-area${dragOver ? ' dragover' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="upload-icon">📁</div>
                  <h4>Drag & Drop your file here</h4>
                  <p>or</p>
                  <button type="button" className="browse-btn"
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    Browse Files
                  </button>
                  <input
                    type="file" id="fileInput" name="file" ref={fileInputRef}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])}
                  />
                  <p className="file-requirements">
                    Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT (Max: 10MB)
                  </p>
                </div>
                {errors.file && <div className="field-error">{errors.file}</div>}

                {file && (
                  <div className="file-preview">
                    <div className="preview-content">
                      <span className="file-icon">{getFileIcon(file.type)}</span>
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                      <button type="button" className="remove-file" onClick={removeFile}>✕</button>
                    </div>
                  </div>
                )}

                {submitting && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${uploadProgress}%`, background: '#4f46e5',
                        height: '100%', borderRadius: '8px', transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <p style={{ fontSize: '13px', marginTop: '6px', color: '#555' }}>
                      {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Saving document details...'}
                    </p>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>Additional Information</h3>
                <div className="form-group">
                  <label htmlFor="tags">Tags (Optional)</label>
                  <input type="text" id="tags" name="tags"
                    placeholder="e.g., data-structures, algorithms, sorting"
                    value={form.tags} onChange={handleChange} />
                  <small>Separate tags with commas</small>
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" id="agreeTerms" name="agreeTerms"
                    checked={form.agreeTerms} onChange={handleChange} />
                  <label htmlFor="agreeTerms">
                    I confirm that I have the right to share this document and it complies with academic integrity policies
                  </label>
                </div>
                {errors.agreeTerms && <div className="field-error">{errors.agreeTerms}</div>}
                <div className="form-group checkbox-group">
                  <input type="checkbox" id="allowDownloads" name="allowDownloads"
                    checked={form.allowDownloads} onChange={handleChange} />
                  <label htmlFor="allowDownloads">Allow others to download this document</label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cta-button secondary"
                  onClick={() => navigate('/browse')} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="cta-button" disabled={submitting}>
                  {submitting ? `Uploading... ${uploadProgress}%` : 'Upload Document'}
                </button>
              </div>

            </form>

            <div className="upload-guidelines">
              <h3>Upload Guidelines</h3>
              <ul>
                <li>✅ Upload only your own work or materials you have permission to share</li>
                <li>✅ Ensure documents are relevant to engineering education</li>
                <li>✅ Use clear, descriptive titles and descriptions</li>
                <li>✅ Choose the correct semester and subject for better organization</li>
                <li>❌ Do not upload copyrighted materials without permission</li>
                <li>❌ Do not upload inappropriate or offensive content</li>
                <li>❌ Avoid uploading duplicate documents</li>
              </ul>
              <div className="guideline-note">
                <strong>Note:</strong> All uploads are reviewed before being published.
                Violations may result in account suspension.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Upload;