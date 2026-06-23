// backend/controllers/profile.controller.js
const { db } = require('../config/firebase');

// GET /api/profile  (requires auth)
const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userSnap = await db.collection('users').doc(uid).get();
    if (!userSnap.exists) return res.status(404).json({ error: 'Profile not found' });
    res.json({ user: userSnap.data() });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
};

// GET /api/profile/my-documents  (requires auth)
const getMyDocuments = async (req, res) => {
  try {
    const uid = req.user.uid;
    const snap = await db.collection('documents')
      .where('uploaderId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ documents: docs });
  } catch (err) {
    console.error('getMyDocuments error:', err);
    res.status(500).json({ error: 'Failed to fetch documents', details: err.message });
  }
};

module.exports = { getProfile, getMyDocuments };