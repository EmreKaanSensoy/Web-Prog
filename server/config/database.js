const mongoose = require('mongoose');

// Online User Schema (istatistik için)
const onlineUserSchema = new mongoose.Schema({
  sessionId: String,
  lastSeen: { type: Date, default: Date.now }
});

// Visitor Counter Schema
const visitorSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

module.exports = {
  OnlineUser: mongoose.model('OnlineUser', onlineUserSchema),
  Visitor: mongoose.model('Visitor', visitorSchema)
};
