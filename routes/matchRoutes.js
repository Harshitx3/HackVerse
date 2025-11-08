const express = require('express');
const { body } = require('express-validator');
const matchController = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const swipeValidation = [
  body('targetUserId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('action')
    .isIn(['like', 'dislike'])
    .withMessage('Action must be either "like" or "dislike"')
];

const undoSwipeValidation = [
  body('action')
    .optional()
    .isIn(['undo'])
    .withMessage('Invalid action')
];

// Swipe routes
router.post('/swipe', protect, swipeValidation, matchController.swipeUser);
router.get('/recommendations', protect, matchController.getSwipeRecommendations);
router.get('/status/:targetUserId', protect, matchController.getMatchStatus);
router.get('/interactions', protect, matchController.getUserInteractions);
router.post('/undo', protect, undoSwipeValidation, matchController.undoLastSwipe);

module.exports = router;