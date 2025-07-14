const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all users (for @mention autocomplete)
router.get('/', getAllUsers);

module.exports = router; 