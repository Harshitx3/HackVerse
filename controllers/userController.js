const User = require('../models/User');
const Match = require('../models/Match');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data
    const userProfile = user.toObject();
    delete userProfile.email;
    delete userProfile.isActive;

    res.status(200).json({
      success: true,
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'fullName', 'bio', 'skills', 'role', 'portfolioUrl', 
      'githubUsername', 'linkedinUrl', 'location', 'preferences'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Check if profile is now completed
    if (updateData.fullName && updateData.bio && updateData.skills && updateData.role) {
      updateData.profileCompleted = true;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file or URL'
      });
    }

    let imageUrl;

    if (req.file) {
      // Upload to Cloudinary
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'skillset/profiles',
          width: 300,
          height: 300,
          crop: 'fill',
          gravity: 'face'
        });
        imageUrl = result.secure_url;
      } else {
        // Fallback to local storage (in production, use proper file storage)
        imageUrl = `/uploads/profiles/${req.file.filename}`;
      }
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        user,
        imageUrl
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

// Get potential matches (users to swipe on)
exports.getPotentialMatches = async (req, res) => {
  try {
    const { page = 1, limit = 10, skills, role } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      _id: { $ne: req.user.id }, // Exclude current user
      isActive: true,
      profileCompleted: true
    };

    // Filter by skills if provided
    if (skills) {
      const skillArray = skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillArray };
    }

    // Filter by role if provided
    if (role) {
      query.role = role;
    }

    // Get users that current user has already interacted with
    const existingMatches = await Match.find({
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ]
    });

    const interactedUserIds = existingMatches.map(match => {
      return match.user1.toString() === req.user.id.toString() 
        ? match.user2 
        : match.user1;
    });

    // Exclude already interacted users
    if (interactedUserIds.length > 0) {
      query._id = { 
        $ne: req.user.id,
        $nin: interactedUserIds 
      };
    }

    // Execute query
    const users = await User.find(query)
      .select('-email -password -isActive')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get potential matches',
      error: error.message
    });
  }
};

// Get user matches (mutual likes)
exports.getUserMatches = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get all matches for current user
    const matches = await Match.find({
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ],
      isMatch: true
    })
    .populate('user1', 'fullName profilePicture role skills bio isOnline lastSeen')
    .populate('user2', 'fullName profilePicture role skills bio isOnline lastSeen')
    .sort({ matchedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Format matches to return the other user's data
    const formattedMatches = matches.map(match => {
      const otherUser = match.user1._id.toString() === req.user.id.toString() 
        ? match.user2 
        : match.user1;
      
      return {
        _id: match._id,
        user: otherUser,
        matchedAt: match.matchedAt,
        conversationStarted: match.conversationStarted,
        lastMessageAt: match.lastMessageAt
      };
    });

    const total = await Match.countDocuments({
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ],
      isMatch: true
    });

    res.status(200).json({
      success: true,
      data: {
        matches: formattedMatches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get matches',
      error: error.message
    });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q, skills, role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const query = {
      _id: { $ne: req.user.id },
      isActive: true,
      profileCompleted: true
    };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Skill filter
    if (skills) {
      const skillArray = skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillArray };
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    let users;
    let total;

    if (q) {
      // Create text index if not exists
      await User.collection.createIndex({ 
        fullName: "text", 
        bio: "text", 
        skills: "text" 
      });
      
      users = await User.find(query, { score: { $meta: "textScore" } })
        .select('-email -password -isActive')
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await User.countDocuments(query);
    } else {
      users = await User.find(query)
        .select('-email -password -isActive')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      
      total = await User.countDocuments(query);
    }

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's matches count
    const matchesCount = await Match.countDocuments({
      $or: [
        { user1: userId },
        { user2: userId }
      ],
      isMatch: true
    });

    // Get total likes received
    const likesReceived = await Match.countDocuments({
      $or: [
        { user1: userId, user2Liked: true },
        { user2: userId, user1Liked: true }
      ]
    });

    // Get profile completion percentage
    const user = await User.findById(userId);
    const profileCompletion = user.getProfileCompletion();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          matches: matchesCount,
          likesReceived,
          profileCompletion,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user stats',
      error: error.message
    });
  }
};

module.exports = exports;