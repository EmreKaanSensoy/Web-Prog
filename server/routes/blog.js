const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// Tüm blog yazılarını listele
// Tüm blog yazılarını listele
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.featured === 'true') {
        query.featured = true;
    }
    
    const blogs = await Blog.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
        success: true,
        blogs,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total
        }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});

// Slug ile tek bir blog yazısını göster
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'username');
    
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog yazısı bulunamadı' });
    }
    
    // Görüntülenme sayısını artır
    blog.views += 1;
    await blog.save();
    
    // İlgili yazılar
    const relatedBlogs = await Blog.find({
      city: blog.city,
      _id: { $ne: blog._id }
    }).limit(3);
    
    res.json({
        success: true,
        blog,
        relatedBlogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});

module.exports = router;
