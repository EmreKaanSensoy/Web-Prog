const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Announcement = require('../models/Announcement');
const Gallery = require('../models/Gallery');

router.get('/', async (req, res) => {
  try {
    const featuredBlogs = await Blog.find({ featured: true })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(6);
    
    const recentAnnouncements = await Announcement.find({ isActive: true, isFeatured: true })
      .sort({ startDate: 1 })
      .limit(5);
    
    const featuredGallery = await Gallery.find({ featured: true })
      .limit(8);
    
    res.json({
      title: 'Ana Sayfa',
      featuredBlogs,
      recentAnnouncements,
      featuredGallery
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

module.exports = router;
