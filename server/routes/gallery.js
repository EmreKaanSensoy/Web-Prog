const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');

// Galeri sayfası
// En çok incelenenleri getir
router.get('/popular', async (req, res) => {
  try {
    const popularGalleries = await Gallery.find().sort({ views: -1 }).limit(6);
    res.json(popularGalleries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Görüntülenme sayısını artır
router.post('/:id/view', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ error: 'Galeri bulunamadı' });
    
    gallery.views = (gallery.views || 0) + 1;
    await gallery.save();
    
    res.json({ success: true, views: gallery.views });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/', async (req, res) => {
  try {
    const city = req.query.city || '';
    const category = req.query.category || '';
    
    let query = {};
    if (city) query.city = city;
    if (category) query.category = category;
    
    const galleries = await Gallery.find(query)
      .sort({ createdAt: -1 });
    
    // Şehir ve kategori listesi
    const cities = await Gallery.distinct('city');
    const categories = await Gallery.distinct('category');
    
    // res.render('gallery/index', {
    //   title: 'Galeri',
    //   galleries,
    //   cities,
    //   categories,
    //   selectedCity: city,
    //   selectedCategory: category
    // });
    res.json({
      galleries,
      cities,
      categories,
      selectedCity: city,
      selectedCategory: category
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

module.exports = router;
