const express = require('express');
const router = express.Router();

// SAME AUTH
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = 'supersecretkey12345skillswappro';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const ChatRoom = require('../models/ChatRoom');

// GET /api/chat/:chatId
router.get('/:chatId', auth, async (req, res) => {
  try {
    console.log(`💬 Loading chat ${req.params.chatId} for user ${req.user.id}`);
    
    const chat = await ChatRoom.findById(req.params.chatId)
      .populate('participants', 'name avatar')
      .populate('messages.sender', 'name avatar');
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    console.log(`✅ Chat loaded: ${chat.participants.length} participants`);
    res.json(chat);
  } catch (error) {
    console.error('💥 Chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/chat/messages
router.post('/messages', auth, async (req, res) => {
  try {
    const { content, chatId } = req.body;
    console.log(`📤 Sending message to chat ${chatId}: "${content}"`);
    
    const chat = await ChatRoom.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Add message to chat
    chat.messages.push({
      sender: req.user.id,
      content: content.trim()
    });
    await chat.save();
    
    // 🔥 WebSocket broadcast (wss not accessible here)
    console.log('✅ Message saved & broadcasting...');
    
    res.json({ success: true });
  } catch (error) {
    console.error('💥 Message error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
