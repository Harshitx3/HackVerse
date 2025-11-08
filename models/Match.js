const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user1Liked: {
    type: Boolean,
    default: false
  },
  user2Liked: {
    type: Boolean,
    default: false
  },
  isMatch: {
    type: Boolean,
    default: false
  },
  matchedAt: {
    type: Date,
    default: null
  },
  user1ActionAt: {
    type: Date,
    default: null
  },
  user2ActionAt: {
    type: Date,
    default: null
  },
  conversationStarted: {
    type: Boolean,
    default: false
  },
  lastMessageAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure unique matches and optimize queries
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ user1: 1, isMatch: 1 });
matchSchema.index({ user2: 1, isMatch: 1 });
matchSchema.index({ isMatch: 1, lastMessageAt: -1 });

// Pre-save middleware to ensure consistent ordering of users
matchSchema.pre('save', function(next) {
  if (this.user1.toString() > this.user2.toString()) {
    // Swap users to maintain consistent ordering
    const tempUser = this.user1;
    const tempLiked = this.user1Liked;
    const tempActionAt = this.user1ActionAt;
    
    this.user1 = this.user2;
    this.user2 = tempUser;
    this.user1Liked = this.user2Liked;
    this.user2Liked = tempLiked;
    this.user1ActionAt = this.user2ActionAt;
    this.user2ActionAt = tempActionAt;
  }
  
  // Check if it's a match
  if (this.user1Liked && this.user2Liked && !this.isMatch) {
    this.isMatch = true;
    this.matchedAt = new Date();
  }
  
  next();
});

// Static method to create or update match
matchSchema.statics.createOrUpdateMatch = async function(userId, targetUserId, action) {
  const user1Id = userId.toString();
  const user2Id = targetUserId.toString();
  
  // Ensure consistent ordering
  const [firstUser, secondUser] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];
  
  const updateData = {};
  if (user1Id === firstUser) {
    updateData.user1Liked = action === 'like';
    updateData.user1ActionAt = new Date();
  } else {
    updateData.user2Liked = action === 'like';
    updateData.user2ActionAt = new Date();
  }
  
  const options = {
    upsert: true,
    new: true,
    runValidators: true
  };
  
  return await this.findOneAndUpdate(
    { user1: firstUser, user2: secondUser },
    updateData,
    options
  );
};

// Method to get match status
matchSchema.methods.getMatchStatus = function(userId) {
  const userStr = userId.toString();
  const isUser1 = this.user1.toString() === userStr;
  
  return {
    hasLiked: isUser1 ? this.user1Liked : this.user2Liked,
    hasBeenLiked: isUser1 ? this.user2Liked : this.user1Liked,
    isMatch: this.isMatch,
    isMutual: this.isMatch
  };
};

module.exports = mongoose.model('Match', matchSchema);