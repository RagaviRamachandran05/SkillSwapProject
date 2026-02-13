// const WebSocket = require('ws');
// const http = require('http');
// const mongoose = require('mongoose');
// require('dotenv').config();

// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap')
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => console.error('❌ MongoDB Error:', err));

// const server = http.createServer();
// const wss = new WebSocket.Server({ port: 5002 });

// wss.on('connection', (ws) => {
//   console.log('🔌 WebSocket client connected!');
  
//   ws.on('message', async (data) => {
//     try {
//       const message = JSON.parse(data.toString());
//       console.log('📨 WS:', message);
      
//       if (message.type === 'join') {
//         ws.chatRoomId = message.chatRoomId;
//         ws.userId = message.userId;
//         console.log(`✅ ${message.userName} joined ${message.chatRoomId}`);
//         return;
//       }
      
//       const ChatRoom = require('./models/ChatRoom');
//       const chatRoom = await ChatRoom.findById(message.chatRoomId);
//       if (chatRoom) {
//         chatRoom.messages.push({
//           content: message.content,
//           sender: message.senderId,
//           timestamp: new Date()
//         });
//         await chatRoom.save();
        
//         wss.clients.forEach(client => {
//           if (client.readyState === WebSocket.OPEN && 
//               client.chatRoomId === message.chatRoomId) {
//             client.send(JSON.stringify({
//               type: 'message',
//               chatRoomId: message.chatRoomId,
//               content: message.content,
//               senderId: message.senderId,
//               senderName: message.senderName,
//               timestamp: new Date().toISOString()
//             }));
//           }
//         });
//       }
//     } catch (error) {
//       console.error('WS Error:', error);
//     }
//   });
  
//   ws.on('close', () => console.log('🔌 WS disconnected'));
// });

// console.log('🚀 WebSocket: ws://localhost:5002');
// server.listen(5002);
