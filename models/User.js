const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['developer', 'designer', 'product-manager', 'business-analyst', 'other'],
    default: 'developer'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  profilePicture: {
    type: String,
    default: ''
  },
  portfolioUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL'],
    default: ''
  },
  githubUsername: {
    type: String,
    trim: true,
    default: ''
  },
  linkedinUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL'],
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    lookingFor: {
      type: String,
      enum: ['collaboration', 'mentorship', 'networking', 'all'],
      default: 'all'
    },
    preferredSkills: [String],
    maxDistance: {
      type: Number,
      default: 50
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries and text search
userSchema.index({ location: '2dsphere' });
userSchema.index({ skills: 1 });
userSchema.index({ role: 1 });
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

// Get profile completion percentage
userSchema.methods.getProfileCompletion = function() {
  const requiredFields = ['fullName', 'bio', 'skills', 'role'];
  let completed = 0;
  
  requiredFields.forEach(field => {
    if (this[field] && this[field].length > 0) {
      completed++;
    }
  });
  
  if (this.profilePicture) completed++;
  if (this.portfolioUrl || this.githubUsername) completed++;
  
  return Math.round((completed / (requiredFields.length + 2)) * 100);
};

module.exports = mongoose.model('User', userSchema);