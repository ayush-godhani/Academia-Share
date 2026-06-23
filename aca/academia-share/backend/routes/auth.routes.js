// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { registerUser, getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.get('/me', verifyToken, getMe);

module.exports = router;