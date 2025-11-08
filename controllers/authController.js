const User = require('../models/User');
const { createSendToken } = require('../middleware/auth');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Register new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Create new user
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: role || 'developer'
    });

    // Send token and user data
    createSendToken(newUser, 201, res);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Update last seen
    await user.updateLastSeen();

    // Send token and user data
    createSendToken(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  // Clear cookies
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
  });
  
  res.cookie('refreshJwt', '', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Get user from collection with password
    const user = await User.findById(req.user.id).select('+password');

    // Check if posted current password is correct
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Your current password is incorrect'
      });
    }

    // If so, update password
    user.password = req.body.newPassword;
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 200, res);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Get user based on posted email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken,
      passwordResetExpires
    });

    // TODO: Send email with reset token
    // For now, we'll just return the token (in production, send via email)
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken, // Only for development - remove in production
      message: 'Reset token sent to email (development mode)'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired'
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in, send JWT
    createSendToken(user, 200, res);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password before deletion
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Soft delete by deactivating account
    user.isActive = false;
    await user.save();

    // Clear cookies
    res.cookie('jwt', '', {
      expires: new Date(Date.now() + 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};

module.exports = exports;