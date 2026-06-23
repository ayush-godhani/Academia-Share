// backend/routes/notices.routes.js
const express = require('express');
const router = express.Router();
const { getNotices, createNotice, deleteNotice } = require('../controllers/notices.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', getNotices);
router.post('/', verifyToken, createNotice);
router.delete('/:id', verifyToken, deleteNotice);

module.exports = router;