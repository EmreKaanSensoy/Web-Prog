const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['yer', 'restoran', 'otel', 'aktivite', 'genel'],
    default: 'genel'
  },
  featured: {
    type: Boolean,
    default: false
  },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
