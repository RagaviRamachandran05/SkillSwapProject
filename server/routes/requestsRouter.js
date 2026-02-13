const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// INLINE AUTH (matches your authRouter.js)
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = 'supersecretkey12345skillswappro';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // { id: user._id }
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

router.post('/', auth, async (req, res) => {
  try {
    console.log('📥 GOT:', req.body);
    
    const { fromUserId, toUserId, fromSkillId, toSkillId } = req.body;
    
    // VALIDATE ALL 4 FIELDS
    if (!fromUserId || !toUserId || !fromSkillId || !toSkillId) {
      console.log('❌ MISSING:', { fromUserId, toUserId, fromSkillId, toSkillId });
      return res.status(400).json({ 
        message: `Missing fields: ${!fromUserId ? 'fromUserId' : ''} ${!toUserId ? 'toUserId' : ''} ${!fromSkillId ? 'fromSkillId' : ''} ${!toSkillId ? 'toSkillId' : ''}` 
      });
    }

    const request = new Request({
      fromUser: fromUserId,
      toUser: toUserId, 
      fromSkill: fromSkillId,
      toSkill: toSkillId
    });

    await request.save();
    const populated = await Request.findById(request._id)
      .populate('fromUser toUser fromSkill toSkill');
    
    console.log('✅ SAVED:', request._id);
    res.status(201).json(populated);
  } catch (error) {
    console.error('💥 ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});


// GET /api/requests/me
router.get('/me', auth, async (req, res) => {
  try {
    const sentRequests = await Request.find({ fromUser: req.user.id })
      .populate('toUser', 'name email avatar')
      .populate('fromSkill', 'title description level')
      .populate('toSkill', 'title description level')
      .sort({ createdAt: -1 });

    const receivedRequests = await Request.find({ toUser: req.user.id })
      .populate('fromUser', 'name email avatar')
      .populate('fromSkill', 'title description level')
      .populate('toSkill', 'title description level')
      .sort({ createdAt: -1 });

    res.json({ sentRequests, receivedRequests });
  } catch (error) {
    console.error('💥 GET /me ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('🔄 Status update:', { id, status, user: req.user.id });
    
    const request = await Request.findById(id).populate('fromUser toUser');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    if (request.toUser._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only receiver can update' });
    }
    
    request.status = status;
    await request.save();
    
    let chatRoomId = null;
    
    // 🔥 CREATE CHAT IF ACCEPTED
    if (status === 'accepted') {
      const ChatRoom = require('../models/ChatRoom');  // Dynamic import
      const chatRoom = new ChatRoom({
        participants: [request.fromUser._id, request.toUser._id],
        requestId: request._id,
        messages: []
      });
      await chatRoom.save();
      chatRoomId = chatRoom._id;
      
      console.log(`💬 CHAT CREATED: ${chatRoomId}`);
    }
    
    res.json({ 
      success: true, 
      message: `Request ${status}!`,
      chatRoomId,  // Only present if accepted
      status 
    });
  } catch (error) {
    console.error('STATUS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});



// ADD this route to your authRouter.js (after /me route):
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user profile + swap stats
    const user = await User.findById(userId)
      .select('name email avatar bio totalSwaps rating socialLinks createdAt');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Count completed swaps
    const completedSwaps = await Request.countDocuments({
      $or: [
        { fromUser: userId, status: 'accepted' },
        { toUser: userId, status: 'accepted' }
      ]
    });
    
    res.json({
      ...user._doc,
      totalSwaps: completedSwaps,
      skillsTaught: await Request.countDocuments({ fromUser: userId, status: 'accepted' }),
      skillsLearned: await Request.countDocuments({ toUser: userId, status: 'accepted' })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/active-chats
// 🔥 ACTIVE CHATS ROUTE - FIXED VERSION
router.get('/active-chats', auth, async (req, res) => {  // ✅ auth (not authenticateToken)
  try {
    console.log('🔍 Getting active chats for:', req.user.id);
    
    // Find accepted requests (received OR sent)
    const requests = await Request.find({
      $or: [
        { toUser: req.user.id, status: 'accepted' },
        { fromUser: req.user.id, status: 'accepted' }
      ]
    })
    .populate('fromUser', 'name')
    .populate('toUser', 'name')
    .sort({ updatedAt: -1 });

    // Format as WhatsApp chats
    const activeChats = requests.map(request => ({  // ✅ request (not req)
      _id: request._id,
      participants: [
        { _id: request.fromUser._id, name: request.fromUser.name },
        { _id: request.toUser._id, name: request.toUser.name }
      ],
      messages: [],
      updatedAt: request.updatedAt  // ✅ request.updatedAt
    }));

    console.log(`✅ ${activeChats.length} active chats found`);
    res.json({ activeChats });
  } catch (error) {
    console.error('❌ Active chats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
