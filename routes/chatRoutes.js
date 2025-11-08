const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('receiverId')
    .isMongoId()
    .withMessage('Invalid receiver ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Invalid message type')
];

// Chat routes
router.post('/send', protect, sendMessageValidation, chatController.sendMessage);
router.get('/conversation/:userId', protect, chatController.getConversation);
router.get('/conversations', protect, chatController.getConversations);
router.patch('/read/:messageId', protect, chatController.markMessageAsRead);
router.delete('/message/:messageId', protect, chatController.deleteMessage);
router.get('/unread-count', protect, chatController.getUnreadCount);

module.exports = router;