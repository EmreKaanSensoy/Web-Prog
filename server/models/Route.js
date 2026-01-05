const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String
  },
  endLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String
  },
  waypoints: [{
    lat: Number,
    lng: Number,
    address: String,
    name: String
  }],
  distance: Number, // km cinsinden
  duration: String, // tahmini süre
  difficulty: {
    type: String,
    enum: ['kolay', 'orta', 'zor'],
    default: 'orta'
  },
  status: {
    type: String,
    enum: ['active', 'draft'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
