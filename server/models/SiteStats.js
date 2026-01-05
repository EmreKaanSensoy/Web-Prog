const mongoose = require('mongoose');

const siteStatsSchema = new mongoose.Schema({
  visitorCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('SiteStats', siteStatsSchema);
