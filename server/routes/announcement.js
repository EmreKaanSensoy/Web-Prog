const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Duyurular sayfası
router.get('/', async (req, res) => {
  try {
    const city = req.query.city || '';
    const type = req.query.type || '';
    
    let query = { isActive: true };
    if (city) query.city = city;
    if (type) query.type = type;
    
    const announcements = await Announcement.find(query)
      .populate('author', 'username')
      .sort({ startDate: 1 });
    
    const cities = await Announcement.distinct('city');
    const types = ['etkinlik', 'senlik', 'duyuru', 'firsat'];
    
    res.json({
      title: 'Duyurular',
      announcements,
      cities,
      types,
      selectedCity: city,
      selectedType: type
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

module.exports = router;
