const Match = require('../models/Match');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Swipe action (like/dislike)
exports.swipeUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { targetUserId, action } = req.body;
    const currentUserId = req.user.id;

    // Validate action
    if (!['like', 'dislike'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "like" or "dislike"'
      });
    }

    // Check if target user exists and is active
    const targetUser = await User.findOne({
      _id: targetUserId,
      isActive: true,
      profileCompleted: true
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found or profile incomplete'
      });
    }

    // Prevent users from swiping on themselves
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot swipe on yourself'
      });
    }

    // Create or update match
    const match = await Match.createOrUpdateMatch(currentUserId, targetUserId, action);

    // Check if it's a mutual match
    let isMatch = false;
    let matchMessage = null;

    if (match.isMatch) {
      isMatch = true;
      matchMessage = 'It\'s a match! You can now start chatting.';
      
      // Get the other user's info for the match notification
      const otherUser = await User.findById(
        match.user1.toString() === currentUserId ? match.user2 : match.user1
      ).select('fullName profilePicture');

      return res.status(200).json({
        success: true,
        message: 'Swipe action completed',
        data: {
          action,
          isMatch: true,
          matchData: {
            matchId: match._id,
            otherUser: {
              id: otherUser._id,
              fullName: otherUser.fullName,
              profilePicture: otherUser.profilePicture
            },
            matchedAt: match.matchedAt
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Swipe action completed',
      data: {
        action,
        isMatch: false
      }
    });

  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process swipe action',
      error: error.message
    });
  }
};

// Get swipe recommendations
exports.getSwipeRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const currentUserId = req.user.id;

    // Get user's preferences
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get users that current user has already interacted with
    const existingMatches = await Match.find({
      $or: [
        { user1: currentUserId },
        { user2: currentUserId }
      ]
    });

    const interactedUserIds = existingMatches.map(match => {
      return match.user1.toString() === currentUserId.toString() 
        ? match.user2 
        : match.user1;
    });

    // Build query for recommendations
    const query = {
      _id: { 
        $ne: currentUserId,
        $nin: interactedUserIds 
      },
      isActive: true,
      profileCompleted: true
    };

    // Apply preferences if available
    if (currentUser.preferences && currentUser.preferences.preferredSkills && currentUser.preferences.preferredSkills.length > 0) {
      query.skills = { $in: currentUser.preferences.preferredSkills };
    }

    if (currentUser.preferences && currentUser.preferences.lookingFor && currentUser.preferences.lookingFor !== 'all') {
      // This would require additional fields in user model for "looking for" preferences
      // For now, we'll skip this filter
    }

    // Get recommendations with randomization
    const recommendations = await User.find(query)
      .select('-email -password -isActive')
      .limit(parseInt(limit) * 2) // Get more to randomize
      .lean();

    // Shuffle the results for variety
    const shuffled = recommendations.sort(() => 0.5 - Math.random());
    const finalRecommendations = shuffled.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        recommendations: finalRecommendations,
        totalAvailable: recommendations.length
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get swipe recommendations',
      error: error.message
    });
  }
};

// Get match status between two users
exports.getMatchStatus = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user.id;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    // Find existing match
    const match = await Match.findOne({
      $or: [
        { user1: currentUserId, user2: targetUserId },
        { user1: targetUserId, user2: currentUserId }
      ]
    });

    if (!match) {
      return res.status(200).json({
        success: true,
        data: {
          hasInteracted: false,
          currentUserAction: null,
          isMatch: false
        }
      });
    }

    const status = match.getMatchStatus(currentUserId);

    res.status(200).json({
      success: true,
      data: {
        hasInteracted: true,
        currentUserAction: status.hasLiked ? 'like' : 'dislike',
        isMatch: status.isMatch,
        matchId: match._id,
        matchedAt: match.matchedAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get match status',
      error: error.message
    });
  }
};

// Get all user interactions (likes/dislikes)
exports.getUserInteractions = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.id;
    const skip = (page - 1) * limit;

    let matchQuery = {
      $or: [
        { user1: currentUserId },
        { user2: currentUserId }
      ]
    };

    // Filter by interaction type
    if (type === 'likes') {
      matchQuery.$or = [
        { user1: currentUserId, user1Liked: true },
        { user2: currentUserId, user2Liked: true }
      ];
    } else if (type === 'dislikes') {
      matchQuery.$or = [
        { user1: currentUserId, user1Liked: false },
        { user2: currentUserId, user2Liked: false }
      ];
    }

    const interactions = await Match.find(matchQuery)
      .populate('user1', 'fullName profilePicture role skills')
      .populate('user2', 'fullName profilePicture role skills')
      .sort({ user1ActionAt: -1, user2ActionAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Format interactions
    const formattedInteractions = interactions.map(interaction => {
      const isUser1 = interaction.user1._id.toString() === currentUserId.toString();
      const otherUser = isUser1 ? interaction.user2 : interaction.user1;
      const userLiked = isUser1 ? interaction.user1Liked : interaction.user2Liked;
      const otherUserLiked = isUser1 ? interaction.user2Liked : interaction.user1Liked;

      return {
        _id: interaction._id,
        otherUser: {
          id: otherUser._id,
          fullName: otherUser.fullName,
          profilePicture: otherUser.profilePicture,
          role: otherUser.role,
          skills: otherUser.skills
        },
        userAction: userLiked ? 'like' : 'dislike',
        otherUserAction: otherUserLiked ? 'like' : 'dislike',
        isMatch: interaction.isMatch,
        matchedAt: interaction.matchedAt,
        actionAt: isUser1 ? interaction.user1ActionAt : interaction.user2ActionAt
      };
    });

    const total = await Match.countDocuments(matchQuery);

    res.status(200).json({
      success: true,
      data: {
        interactions: formattedInteractions,
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
      message: 'Failed to get user interactions',
      error: error.message
    });
  }
};

// Undo last swipe (optional feature)
exports.undoLastSwipe = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find the most recent interaction by current user
    const lastInteraction = await Match.findOne({
      $or: [
        { user1: currentUserId, user1ActionAt: { $ne: null } },
        { user2: currentUserId, user2ActionAt: { $ne: null } }
      ]
    })
    .sort({ user1ActionAt: -1, user2ActionAt: -1 })
    .populate('user1', 'fullName')
    .populate('user2', 'fullName');

    if (!lastInteraction) {
      return res.status(404).json({
        success: false,
        message: 'No recent swipe found to undo'
      });
    }

    // Check if enough time has passed (e.g., 5 minutes)
    const actionTime = lastInteraction.user1.toString() === currentUserId.toString() 
      ? lastInteraction.user1ActionAt 
      : lastInteraction.user2ActionAt;
    
    const timeDiff = Date.now() - actionTime.getTime();
    const maxUndoTime = 5 * 60 * 1000; // 5 minutes

    if (timeDiff > maxUndoTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot undo swipe after 5 minutes'
      });
    }

    // Delete the interaction (or reset it if it's not a match)
    if (lastInteraction.isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Cannot undo swipe that resulted in a match'
      });
    }

    await Match.findByIdAndDelete(lastInteraction._id);

    res.status(200).json({
      success: true,
      message: 'Last swipe undone successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to undo last swipe',
      error: error.message
    });
  }
};

module.exports = exports;