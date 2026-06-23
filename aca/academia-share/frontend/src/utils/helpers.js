// frontend/src/utils/helpers.js

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(dateIso) {
  const now = Date.now();
  const past = new Date(dateIso).getTime();
  const diff = Math.max(0, Math.floor((now - past) / 1000));
  const units = [
    { s: 60, name: 'second' }, { s: 60, name: 'minute' },
    { s: 24, name: 'hour' }, { s: 7, name: 'day' },
    { s: 4.345, name: 'week' }, { s: 12, name: 'month' },
    { s: Infinity, name: 'year' },
  ];
  let count = diff, i = 0;
  for (; i < units.length; i++) { if (count < units[i].s) break; count = Math.floor(count / units[i].s); }
  const name = units[i]?.name || 'second';
  return count <= 1 ? `1 ${name} ago` : `${count} ${name}s ago`;
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(mimeOrType) {
  if (!mimeOrType) return '📄';
  const m = mimeOrType.toLowerCase();
  if (m.includes('pdf') || m === 'pdf') return '📕';
  if (m.includes('word') || m === 'doc') return '📘';
  if (m.includes('powerpoint') || m === 'ppt') return '📙';
  if (m.includes('text') || m === 'txt') return '📃';
  return '📄';
}

export function calculatePasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 'weak', text: 'Weak password', color: '#ef4444', width: '33%' };
  if (score <= 4) return { level: 'medium', text: 'Medium strength', color: '#f59e0b', width: '66%' };
  return { level: 'strong', text: 'Strong password', color: '#10b981', width: '100%' };
}

export const SUBJECT_LABELS = {
  mathematics: 'Mathematics', physics: 'Physics', chemistry: 'Chemistry',
  programming: 'Programming', electronics: 'Electronics',
  mechanical: 'Mechanical Engineering', electrical: 'Electrical Engineering',
  'computer-science': 'Computer Science', civil: 'Civil Engineering',
  english: 'English', other: 'Other',
};