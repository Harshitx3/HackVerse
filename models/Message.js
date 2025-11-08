const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  originalContent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ sender: 1, isDeleted: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for conversation ID (combination of sender and receiver IDs)
messageSchema.virtual('conversationId').get(function() {
  const senderId = this.sender.toString();
  const receiverId = this.receiver.toString();
  return senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
});

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to soft delete message
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2, limit = 50, skip = 0) {
  return await this.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 }
    ],
    isDeleted: false
  })
  .populate('sender', 'fullName profilePicture')
  .populate('receiver', 'fullName profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    receiver: userId,
    isRead: false,
    isDeleted: false
  });
};

// Static method to mark all messages as read in a conversation
messageSchema.statics.markConversationAsRead = async function(userId, otherUserId) {
  return await this.updateMany(
    {
      sender: otherUserId,
      receiver: userId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

module.exports = mongoose.model('Message', messageSchema);