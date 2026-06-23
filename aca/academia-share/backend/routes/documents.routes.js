const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/auth.middleware');

const {
  getDocuments,
  getRecentDocuments,
  getPopularDocuments,
  getUploadSignature,   // ✅ add this
  uploadDocument,
  incrementView,
  incrementDownload,
  deleteDocument,
} = require('../controllers/documents.controller');

// Routes
router.get('/', getDocuments);
router.get('/recent', getRecentDocuments);
router.get('/popular', getPopularDocuments);
router.get('/upload-signature', verifyToken, getUploadSignature);  // ✅ add this

router.post('/', verifyToken, uploadDocument);  // ✅ changed from /upload to /

router.patch('/:id/view', incrementView);
router.patch('/:id/download', incrementDownload);
router.delete('/:id', verifyToken, deleteDocument);

module.exports = router;