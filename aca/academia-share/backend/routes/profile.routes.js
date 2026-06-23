// backend/routes/profile.routes.js
const express = require('express');
const router = express.Router();
const { getProfile, getMyDocuments } = require('../controllers/profile.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getProfile);
router.get('/my-documents', verifyToken, getMyDocuments);

module.exports = router;