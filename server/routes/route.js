const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

router.get('/my-routes', async (req, res) => {
    try {
        if (!req.session.user && !req.session.admin) {
             return res.status(401).json({ success: false, error: 'Oturum açmalısınız.' });
        }

        let query = {};
        if (req.session.user) {
            query.userId = req.session.user._id;
        } else {
            query.createdBy = req.session.admin._id;
        }

        const routes = await Route.find(query).sort({ createdAt: -1 });
        res.json(routes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
});

// Rota çizme sayfası - Public Listing + Search
router.get('/', async (req, res) => {
  try {
    let query = {};
    const { city, distance, duration } = req.query;

    if (city) query.city = { $regex: city, $options: 'i' };
    if (distance) query.distance = { $gte: parseFloat(distance) };
    if (duration) query.duration = { $regex: duration, $options: 'i' };

    // Kamu listeleme mantığı: Tüm kamu rotalarını göster? Yoksa arama yoksa sadece başarı:doğru ve [] döndür?
    // Şimdilik kamu rotalarının tüm rotalar olduğunu varsayalım.
    
    // Arama parametreleri yoksa, belki limit?
    const routes = await Route.find(query)
      .populate('createdBy', 'username')
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    res.json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

// Yeni rota oluştur (AJAX)
router.post('/create', async (req, res) => {
  try {
    console.log('Gelen veri:', req.body);

    const { title, description, city, startLocation, endLocation, waypoints, distance, duration, difficulty } = req.body;

    // Validasyon
    if (!title || !city) {
      return res.json({ success: false, error: 'Rota başlığı ve şehir zorunludur!' });
    }

    if (!startLocation || !endLocation) {
      return res.json({ success: false, error: 'Başlangıç ve bitiş noktaları zorunludur!' });
    }

    // JSON parse işlemleri (güvenli)
    let parsedStartLocation, parsedEndLocation, parsedWaypoints = [];

    try {
      parsedStartLocation = typeof startLocation === 'string' ? JSON.parse(startLocation) : startLocation;
      parsedEndLocation = typeof endLocation === 'string' ? JSON.parse(endLocation) : endLocation;
      if (waypoints && waypoints !== '[]') {
        parsedWaypoints = typeof waypoints === 'string' ? JSON.parse(waypoints) : waypoints;
      }
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      return res.json({ success: false, error: 'Konum verileri hatalı!' });
    }

    // Giriş kontrolü
    if (!req.session.user && !req.session.admin) {
      return res.json({ success: false, error: 'Rotayı kaydetmek için giriş yapmalısınız!' });
    }

    const newRoute = new Route({
      title,
      description: description || '',
      city,
      startLocation: {
        lat: parsedStartLocation.lat,
        lng: parsedStartLocation.lng,
        address: parsedStartLocation.address || ''
      },
      endLocation: {
        lat: parsedEndLocation.lat,
        lng: parsedEndLocation.lng,
        address: parsedEndLocation.address || ''
      },
      waypoints: parsedWaypoints,
      distance: distance ? parseFloat(distance) : null,
      duration: duration || '',
      difficulty: difficulty || 'orta',
      createdBy: req.session.admin ? req.session.admin._id : null,
      userId: req.session.user ? req.session.user._id : null
    });

    await newRoute.save();
    console.log('Rota kaydedildi:', newRoute._id);
    res.json({ success: true, route: newRoute });
  } catch (error) {
    console.error('Rota kaydetme hatası:', error);
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
