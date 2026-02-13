const mongoose = require('mongoose');
const chatRoomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('ChatRoom', chatRoomSchema);
