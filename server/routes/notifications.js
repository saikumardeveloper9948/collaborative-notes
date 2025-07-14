const express = require('express');
const router = express.Router();
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get user notifications
router.get('/', getUserNotifications);

// Mark all notifications as read (must come before parameterized route)
router.patch('/read-all', markAllAsRead);

// Mark notification as read
router.patch('/:notificationId/read', markAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

module.exports = router; 