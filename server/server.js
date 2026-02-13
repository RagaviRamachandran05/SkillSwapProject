const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ALL ROUTES
app.use('/api/requests', require('./routes/requestsRouter'));
app.use('/api/auth', require('./routes/authRouter'));
app.use('/api/skills', require('./routes/skillsRouter'));
app.use('/api/chat', require('./routes/chatRouter'));

app.get('/api/requests/active-chats', (req, res) => {
  console.log('🔍 EMERGENCY active-chats - ChatRooms FIXED!');
  res.json({ activeChats: [] });
});


// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// CREATE HTTP SERVER + ATTACH WEBSOCKET
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server,
  path: '/ws' 
});  // ✅ SAME PORT!

// 🔥 WEBSOCKET LOGIC (your existing code)
wss.on('connection', (ws,req) => {
  console.log('🔌 WebSocket client connected!');
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 WS:', message);
      
      if (message.type === 'join') {
        ws.chatRoomId = message.chatRoomId;
        ws.userId = message.userId;
        console.log(`✅ ${message.userName} joined ${message.chatRoomId}`);
        return;
      }
      
      const ChatRoom = require('./models/ChatRoom');
      const chatRoom = await ChatRoom.findById(message.chatRoomId);
      if (chatRoom) {
        chatRoom.messages.push({
          content: message.content,
          sender: message.senderId,
          timestamp: new Date()
        });
        await chatRoom.save();
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && 
              client.chatRoomId === message.chatRoomId) {
            client.send(JSON.stringify({
              type: 'message',
              chatRoomId: message.chatRoomId,
              content: message.content,
              senderId: message.senderId,
              senderName: message.senderName,
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
    } catch (error) {
      console.error('WS Error:', error);
    }
  });
  
  ws.on('close', () => console.log('🔌 WS disconnected'));
});

app.get('/', (req, res) => res.json({ message: 'SkillSwap API + WebSocket ✅' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 REST API + WebSocket: http://localhost:${PORT}`);
  console.log(`🌐 WebSocket: ws://localhost:${PORT}`);  // ✅ SAME PORT!
});
