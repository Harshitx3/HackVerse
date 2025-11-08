const Message = require('../models/Message');
const Match = require('../models/Match');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user.id;

    // Check if users have a match
    const match = await Match.findOne({
      $or: [
        { user1: senderId, user2: receiverId, isMatch: true },
        { user1: receiverId, user2: senderId, isMatch: true }
      ]
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users you have matched with'
      });
    }

    // Check if receiver exists and is active
    const receiver = await User.findOne({
      _id: receiverId,
      isActive: true
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found or inactive'
      });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      messageType
    });

    // Update conversation started status if not already set
    if (!match.conversationStarted) {
      match.conversationStarted = true;
      match.lastMessageAt = new Date();
      await match.save();
    }

    // Update match's last message timestamp
    match.lastMessageAt = new Date();
    await match.save();

    // Populate sender and receiver data
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName profilePicture')
      .populate('receiver', 'fullName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Check if users have a match
    const match = await Match.findOne({
      $or: [
        { user1: currentUserId, user2: userId, isMatch: true },
        { user1: userId, user2: currentUserId, isMatch: true }
      ]
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'You can only view conversations with matched users'
      });
    }

    // Get messages
    const messages = await Message.getConversation(currentUserId, userId, parseInt(limit), skip);

    // Mark messages as read
    await Message.markConversationAsRead(currentUserId, userId);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error.message
    });
  }
};

// Get user's conversations list
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get all matches for current user
    const matches = await Match.find({
      $or: [
        { user1: currentUserId },
        { user2: currentUserId }
      ],
      isMatch: true
    })
    .populate('user1', 'fullName profilePicture isOnline lastSeen')
    .populate('user2', 'fullName profilePicture isOnline lastSeen')
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Format conversations with last message
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.user1._id.toString() === currentUserId.toString() 
          ? match.user2 
          : match.user1;

        // Get last message
        const lastMessage = await Message.findOne({
          $or: [
            { sender: currentUserId, receiver: otherUser._id },
            { sender: otherUser._id, receiver: currentUserId }
          ],
          isDeleted: false
        })
        .populate('sender', 'fullName')
        .sort({ createdAt: -1 });

        // Get unread count
        const unreadCount = await Message.countDocuments({
          sender: otherUser._id,
          receiver: currentUserId,
          isRead: false,
          isDeleted: false
        });

        return {
          _id: match._id,
          otherUser: {
            id: otherUser._id,
            fullName: otherUser.fullName,
            profilePicture: otherUser.profilePicture,
            isOnline: otherUser.isOnline,
            lastSeen: otherUser.lastSeen
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender: lastMessage.sender.fullName,
            createdAt: lastMessage.createdAt,
            isRead: lastMessage.isRead
          } : null,
          unreadCount,
          conversationStarted: match.conversationStarted,
          matchedAt: match.matchedAt,
          lastMessageAt: match.lastMessageAt
        };
      })
    );

    const total = await Match.countDocuments({
      $or: [
        { user1: currentUserId },
        { user2: currentUserId }
      ],
      isMatch: true
    });

    res.status(200).json({
      success: true,
      data: {
        conversations,
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
      message: 'Failed to get conversations',
      error: error.message
    });
  }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark your received messages as read'
      });
    }

    // Mark as read
    await message.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// Delete message (soft delete)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Soft delete
    await message.softDelete();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const unreadCount = await Message.getUnreadCount(currentUserId);

    res.status(200).json({
      success: true,
      data: {
        unreadCount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Socket.io handlers
exports.socketHandlers = (io, socket) => {
  const currentUserId = socket.userId;

  // Join user room
  socket.join(`user_${currentUserId}`);

  // Handle typing indicator
  socket.on('typing', async (data) => {
    const { receiverId } = data;
    
    // Verify they have a match
    const match = await Match.findOne({
      $or: [
        { user1: currentUserId, user2: receiverId, isMatch: true },
        { user1: receiverId, user2: currentUserId, isMatch: true }
      ]
    });

    if (match) {
      socket.to(`user_${receiverId}`).emit('userTyping', {
        senderId: currentUserId,
        isTyping: true
      });
    }
  });

  // Handle stop typing
  socket.on('stopTyping', async (data) => {
    const { receiverId } = data;
    
    const match = await Match.findOne({
      $or: [
        { user1: currentUserId, user2: receiverId, isMatch: true },
        { user1: receiverId, user2: currentUserId, isMatch: true }
      ]
    });

    if (match) {
      socket.to(`user_${receiverId}`).emit('userTyping', {
        senderId: currentUserId,
        isTyping: false
      });
    }
  });

  // Handle message sending via socket
  socket.on('sendMessage', async (data) => {
    try {
      const { receiverId, content, messageType = 'text' } = data;

      // Verify match exists
      const match = await Match.findOne({
        $or: [
          { user1: currentUserId, user2: receiverId, isMatch: true },
          { user1: receiverId, user2: currentUserId, isMatch: true }
        ]
      });

      if (!match) {
        socket.emit('error', { message: 'No match found' });
        return;
      }

      // Create message
      const message = await Message.create({
        sender: currentUserId,
        receiver: receiverId,
        content: content.trim(),
        messageType
      });

      // Update match
      match.conversationStarted = true;
      match.lastMessageAt = new Date();
      await match.save();

      // Populate message data
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'fullName profilePicture')
        .populate('receiver', 'fullName profilePicture');

      // Emit to receiver
      socket.to(`user_${receiverId}`).emit('newMessage', {
        message: populatedMessage
      });

      // Emit to sender for confirmation
      socket.emit('messageSent', {
        message: populatedMessage
      });

    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle user online status
  socket.on('userOnline', async () => {
    await User.findByIdAndUpdate(currentUserId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Notify matched users about online status
    const matches = await Match.find({
      $or: [
        { user1: currentUserId, isMatch: true },
        { user2: currentUserId, isMatch: true }
      ]
    });

    matches.forEach(match => {
      const otherUserId = match.user1.toString() === currentUserId.toString() 
        ? match.user2.toString() 
        : match.user1.toString();
      
      socket.to(`user_${otherUserId}`).emit('userStatusChanged', {
        userId: currentUserId,
        isOnline: true,
        lastSeen: new Date()
      });
    });
  });

  // Handle user offline status
  socket.on('disconnect', async () => {
    await User.findByIdAndUpdate(currentUserId, {
      isOnline: false,
      lastSeen: new Date()
    });

    // Notify matched users about offline status
    const matches = await Match.find({
      $or: [
        { user1: currentUserId, isMatch: true },
        { user2: currentUserId, isMatch: true }
      ]
    });

    matches.forEach(match => {
      const otherUserId = match.user1.toString() === currentUserId.toString() 
        ? match.user2.toString() 
        : match.user1.toString();
      
      socket.to(`user_${otherUserId}`).emit('userStatusChanged', {
        userId: currentUserId,
        isOnline: false,
        lastSeen: new Date()
      });
    });
  });
};

module.exports = exports;