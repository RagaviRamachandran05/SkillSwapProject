const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // 🔥 FULL FILE SUPPORT
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    type: { 
      type: String, 
      enum: ['text', 'file'],  // 🔥 REQUIRED!
      default: 'text' 
    },
    content: String,          // Text messages
    filename: String,         // 🔥 File name
    filesize: String,         // 🔥 File size
    fileUrl: String,          // 🔥 File download URL
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }],
  
  isActive: { type: Boolean, default: true },
  lastMessage: String
}, { timestamps: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
