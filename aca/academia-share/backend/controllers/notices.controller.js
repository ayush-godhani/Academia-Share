// backend/controllers/notices.controller.js
const { db } = require('../config/firebase');

// GET /api/notices
const getNotices = async (req, res) => {
  try {
    const snap = await db.collection('notices').orderBy('createdAt', 'desc').limit(50).get();
    const notices = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ notices });
  } catch (err) {
    console.error('getNotices error:', err);
    res.status(500).json({ error: 'Failed to fetch notices', details: err.message });
  }
};

// POST /api/notices  (requires auth)
const createNotice = async (req, res) => {
  try {
    const user = req.user;
    const { title, content, category, important } = req.body;

    if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

    // Get poster name from Firestore
    let postedByName = user.email;
    let postedByRole = 'student';
    const userSnap = await db.collection('users').doc(user.uid).get();
    if (userSnap.exists) {
      const u = userSnap.data();
      postedByName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || user.email;
      postedByRole = u.userType || 'student';
    }

    const noticeData = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      important: important === true || important === 'true',
      postedById: user.uid,
      postedByName,
      postedByRole,
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection('notices').add(noticeData);
    res.status(201).json({ message: 'Notice posted successfully', notice: { id: ref.id, ...noticeData } });
  } catch (err) {
    console.error('createNotice error:', err);
    res.status(500).json({ error: 'Failed to post notice', details: err.message });
  }
};

// DELETE /api/notices/:id  (requires auth - only poster can delete)
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const ref = db.collection('notices').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Notice not found' });
    if (snap.data().postedById !== user.uid) return res.status(403).json({ error: 'Not authorized to delete this notice' });
    await ref.delete();
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    console.error('deleteNotice error:', err);
    res.status(500).json({ error: 'Failed to delete notice', details: err.message });
  }
};

module.exports = { getNotices, createNotice, deleteNotice };