const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation rules
const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('role')
    .optional()
    .isIn(['developer', 'designer', 'product-manager', 'business-analyst', 'other'])
    .withMessage('Invalid role specified'),
  body('portfolioUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid portfolio URL'),
  body('githubUsername')
    .optional()
    .trim()
    .isLength({ max: 39 })
    .withMessage('GitHub username is too long'),
  body('linkedinUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
];

// User profile routes
router.get('/profile/me', protect, userController.getCurrentUserProfile);
router.get('/profile/:userId', protect, userController.getUserProfile);
router.patch('/profile', protect, updateProfileValidation, userController.updateProfile);
router.post('/profile/picture', protect, upload.single('profilePicture'), userController.uploadProfilePicture);

// Discovery and matching routes
router.get('/discover', protect, userController.getPotentialMatches);
router.get('/matches', protect, userController.getUserMatches);
router.get('/search', protect, userController.searchUsers);

// User stats
router.get('/stats', protect, userController.getUserStats);

module.exports = router;