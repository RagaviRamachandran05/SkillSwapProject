const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const ChatRoom = require('./models/ChatRoom');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const LIVE_USERS = new Map();  // userId → ws socket

// 🔥 1. CREATE UPLOADS FOLDER
const uploadsDir = path.join(__dirname, 'uploads');if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads folder');
}

// 🔥 2. MULTER CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip|mp4|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, docs, zip, mp4, txt allowed'));
  }
});

// 🔥 3. AUTH MIDDLEWARE
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    // Verified against your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = { id: decoded.id, name: decoded.name };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// 🔥 CREATE APP
const app = express();

// 🔥 4. MIDDLEWARE
app.use(cors({ 
  origin: ['http://:3000', 'https://skill-swap-project-one.vercel.app'], 
  credentials: true 
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));
// 🔥 5. FILE UPLOAD ROUTE
app.post('/api/chat/upload', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('📎 UPLOAD ROUTE HIT - AUTH:', req.user?.id);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { chatId } = req.body;
    
    const fileMessage = {
      sender: req.user.id,
      senderName: req.user.name,
      type: 'file',
      filename: req.file.originalname,
      filesize: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
      fileUrl: `/uploads/${req.file.filename}`,
      createdAt: new Date(),
      read: false
    };

    const chatRoom = await ChatRoom.findByIdAndUpdate(
      chatId,
      { 
        $push: { messages: fileMessage },
        $set: { 
          lastMessage: `${req.user.name} sent a file: ${req.file.originalname}`,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    console.log('✅ FILE SAVED TO DB:', fileMessage.filename);

    res.json({
      success: true,
      messageId: fileMessage._id || Date.now().toString(),
      filename: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`
    });

  } catch (error) {
    console.error('❌ File upload error:', error.message);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// 🔥 VIDEO LESSON TOKEN GENERATION (ADD THIS!)

// 🔥 ADD THIS ROUTE after file upload route (around line 150)
app.post('/api/chat/start-video-lesson', auth, async (req, res) => {
  try {
    const { chatId } = req.body;
    console.log('🎥 GENERATE TOKEN for chatId:', chatId);
    
    const meetingId = `skillswap-${chatId}-${Date.now()}`;
    
    // 🔥 VideoSDK JWT TOKEN
    const payload = {
      apikey: process.env.VIDEOSDK_API_KEY,
      permissions: ['allow_join', 'allow_mod'],
      roomId: meetingId,
      version: 2
    };
    
    const token = jwt.sign(payload, process.env.VIDEOSDK_SECRET_KEY, {
      expiresIn: '120m',
      algorithm: 'HS256'
    });
    
    console.log('✅ VideoSDK token created:', token.substring(0, 20) + '...');
    
    res.json({ 
      success: true,
      meetingId,
      token 
    });
    
  } catch (error) {
    console.error('❌ Video token error:', error.message);
    res.status(500).json({ error: 'Video token generation failed' });
  }
});


// 🔥 6. API ROUTES
app.use('/api/requests', require('./routes/requestsRouter'));
app.use('/api/auth', require('./routes/authRouter'));
app.use('/api/skills', require('./routes/skillsRouter'));
app.use('/api/chat', require('./routes/chatRouter'));

// 🔥 7. MONGODB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// 🔥 8. HTTP + WEBSOCKET
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.set('wss', wss);
console.log('✅ WebSocket attached to Express app');

// 🔥 9. FIXED WEBSOCKET - PROPERLY CLOSED
// 🔥 9. LIVE USER TRACKING + SMART INVITES

// 🔥 9. LIVE USER TRACKING + WEBSOCKET LOGIC
wss.on('connection', (ws) => {
  ws.isAlive = true;
  console.log('🔌 WS Client connected. Total:', wss.clients.size);

  // Handle Pong responses to keep connection alive
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 WS Received:', message.type);
      
      // 1️⃣ JOIN ROOM + TRACK LIVE USER
      if (message.type === 'join') {
        ws.userId = message.userId;
        ws.chatRoomId = message.chatRoomId;
        LIVE_USERS.set(message.userId, ws); 
        
        console.log(`✅ User ${message.userId} is LIVE in Room ${message.chatRoomId}`);
        console.log(`👥 Total Live Users: ${LIVE_USERS.size}`);
        return;
      }
      
      // 2️⃣ VIDEO INVITE REQUEST (WITH LIVE CHECK)
      if (message.type === 'video-invite-request') {
        const receiverWs = LIVE_USERS.get(message.receiverId);
        
        // CHECK: Is receiver actually online?
        if (!receiverWs || receiverWs.readyState !== WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'video-invite-failed',
            message: `❌ ${message.receiverName} is currently OFFLINE`,
            timestamp: new Date().toLocaleTimeString()
          }));
          return;
        }

        // GENERATE VIDEOSDK TOKEN
        const meetingId = `skillswap-${message.chatRoomId}-${Date.now()}`;
        const payload = {
          apikey: process.env.VIDEOSDK_API_KEY,
          permissions: ['allow_join', 'allow_mod'],
          roomId: meetingId,
          version: 2
        };
        
        const token = jwt.sign(payload, process.env.VIDEOSDK_SECRET_KEY, {
          expiresIn: '120m', 
          algorithm: 'HS256'
        });

        const inviteData = {
          type: 'video-invite',
          chatRoomId: message.chatRoomId,
          senderId: message.senderId,
          senderName: message.senderName,
          receiverId: message.receiverId,
          meetingId,
          token,
          timestamp: new Date().toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };

        // SEND TO RECEIVER
        receiverWs.send(JSON.stringify(inviteData));
        
        // CONFIRM TO SENDER
        ws.send(JSON.stringify({
          type: 'video-invite-sent',
          message: `✅ Invite sent to ${message.receiverName}`,
          timestamp: inviteData.timestamp
        }));
        return;
      }

      // 3️⃣ CHAT MESSAGE HANDLER
      if (message.type === 'message') {
        // Broadcast to all clients in the same chat room
        const broadcastData = JSON.stringify({
          type: 'new-message',
          ...message
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.chatRoomId === message.chatRoomId) {
            client.send(broadcastData);
          }
        });
      }

      // 4️⃣ FILE NOTIFICATION HANDLER
      if (message.type === 'file-uploaded') {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.chatRoomId === message.chatRoomId) {
            client.send(JSON.stringify({
              type: 'new-file',
              ...message
            }));
          }
        });
      }
      
    } catch (error) {
      console.error('❌ WS Message Error:', error);
    }
  });

  ws.on('error', (err) => console.error('WS Socket Error:', err));

  ws.on('close', () => {
    if (ws.userId) {
      LIVE_USERS.delete(ws.userId);
      console.log(`❌ User ${ws.userId} went OFFLINE. Remaining: ${LIVE_USERS.size}`);
    }
  });
});

// 🔥 PRODUCTION HEARTBEAT (Runs every 30s to prevent Render from killing the connection)
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      if (ws.userId) LIVE_USERS.delete(ws.userId);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});


// 🔥 10. HEALTH CHECK
app.get('/', (req, res) => {
  res.json({
    message: '🚀 SkillSwap Pro API + WebSocket LIVE!',
    timestamp: new Date().toISOString(),
    websocket: 'ws://localhost:5000/ws',
    fileUpload: 'POST /api/chat/upload ✅ WITH AUTH + DB',
    status: 'production-ready'
  });
});

// 🔥 11. 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 SkillSwap Pro FULLSTACK LIVE!`);
  console.log(`📡 REST API: http://localhost:${PORT}`);
  console.log(`🌐 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`📎 File Upload: POST http://localhost:${PORT}/api/chat/upload (AUTH+DB)`);
  console.log(`📁 Static Files: http://localhost:${PORT}/uploads/...`);
  console.log(`✅ Messages + Files PERSIST ON REFRESH!\n`);
});
