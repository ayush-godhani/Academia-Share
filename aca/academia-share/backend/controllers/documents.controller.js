const cloudinary = require("../config/cloudinary");
const { db } = require('../config/firebase');

// ===== GET ALL DOCUMENTS =====
const getDocuments = async (req, res) => {
  try {
    let { semester, subject, search, sort, page = 1, limit = 9 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Fetch all docs and filter in memory — avoids composite index issues
    const snapshot = await db.collection('documents').get();
    let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by semester
    if (semester && semester !== 'all') {
      docs = docs.filter(d => d.semester === semester);
    }

    // Filter by subject
    if (subject && subject !== 'all') {
      docs = docs.filter(d => d.subject === subject);
    }

    // Filter by search
    if (search) {
      const term = search.toLowerCase();
      docs = docs.filter(d =>
        d.title?.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sort === 'popular') {
      docs.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sort === 'alphabetical') {
      docs.sort((a, b) => a.title?.localeCompare(b.title));
    } else {
      // newest first
      docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = docs.length;
    const start = (page - 1) * limit;
    res.json({ documents: docs.slice(start, start + limit), total });
  } catch (err) {
    console.error("getDocuments error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ===== RECENT =====
const getRecentDocuments = async (req, res) => {
  try {
    const snap = await db.collection('documents').orderBy('createdAt', 'desc').limit(3).get();
    res.json({ documents: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== POPULAR =====
const getPopularDocuments = async (req, res) => {
  try {
    const snap = await db.collection('documents').orderBy('viewCount', 'desc').limit(3).get();
    res.json({ documents: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== CLOUDINARY SIGNATURE =====
const getUploadSignature = (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'documents' },
      process.env.CLOUDINARY_API_SECRET
    );
    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== UPLOAD =====
const uploadDocument = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, semester, subject, documentType,
            visibility, allowDownloads, tags, fileUrl, publicId, fileSize, format } = req.body;

    if (!fileUrl) return res.status(400).json({ error: 'File URL missing' });
    if (!title || !semester || !subject) return res.status(400).json({ error: 'title, semester and subject are required' });

    let uploaderName = user.email;
    const userSnap = await db.collection('users').doc(user.uid).get();
    if (userSnap.exists) {
      const u = userSnap.data();
      uploaderName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || user.email;
    }

    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const docData = {
      title,
      description: description || '',
      semester,
      subject,
      documentType: documentType || 'notes',
      visibility: visibility || 'public',
      allowDownloads: allowDownloads === 'true' || allowDownloads === true,
      tags: tagsArray,
      fileUrl,
      publicId: publicId || '',
      fileSize: parseInt(fileSize) || 0,
      format: format || '',
      uploaderId: user.uid,
      uploaderName,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      downloadCount: 0,
    };

    const docRef = await db.collection('documents').add(docData);
    res.status(201).json({ message: 'Uploaded successfully', document: { id: docRef.id, ...docData } });
  } catch (err) {
    console.error('uploadDocument error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ===== VIEW COUNT =====
const incrementView = async (req, res) => {
  try {
    await db.collection('documents').doc(req.params.id).update({
      viewCount: require('firebase-admin').firestore.FieldValue.increment(1)
    });
    res.json({ message: 'View updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== DOWNLOAD COUNT =====
const incrementDownload = async (req, res) => {
  try {
    await db.collection('documents').doc(req.params.id).update({
      downloadCount: require('firebase-admin').firestore.FieldValue.increment(1)
    });
    res.json({ message: 'Download updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== DELETE =====
// ===== DELETE =====
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const docRef = db.collection('documents').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return res.status(404).json({ error: 'Document not found' });

    const docData = docSnap.data();
    if (docData.uploaderId !== user.uid) return res.status(403).json({ error: 'Not authorized' });

    // Delete from Firestore first (fast)
    await docRef.delete();

    // Respond immediately — don't wait for Cloudinary
    res.json({ message: 'Deleted successfully' });

    // Delete from Cloudinary in background (slow, don't block response)
    if (docData.publicId) {
      cloudinary.uploader.destroy(docData.publicId, { resource_type: 'raw' })
        .catch(err => console.log('Cloudinary delete failed:', err.message));
    }

  } catch (err) {
    console.error('deleteDocument error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDocuments, getRecentDocuments, getPopularDocuments,
  getUploadSignature, uploadDocument,
  incrementView, incrementDownload, deleteDocument,
};