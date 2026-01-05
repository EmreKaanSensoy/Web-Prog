const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAdmin } = require('../middleware/auth');
const Admin = require('../models/Admin');
const Blog = require('../models/Blog');
const Gallery = require('../models/Gallery');
const Route = require('../models/Route');
const User = require('../models/User');

const Announcement = require('../models/Announcement');

// Upload klasörü yoksa oluştur
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'));
    }
  }
});

// Login sayfası
router.get('/login', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  if (req.session.user) {
    return res.redirect('/');
  }
  // CSRF token'ı manuel olarak oluştur
  let csrfToken = '';
  try {
    csrfToken = req.csrfToken ? req.csrfToken() : '';
  } catch (err) {
    // CSRF token oluşturulamazsa boş bırak
  }
  res.json({ title: 'Admin Girişi', csrfToken });
});

// Login işlemi
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı!'
      });
    }

    const isValid = await admin.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı!'
      });
    }

    req.session.admin = {
      _id: admin._id,
      username: admin.username,
      email: admin.email
    };

    // For JSON helper
    res.json({ success: true, redirectUrl: '/admin/dashboard' });
    // res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Giriş sırasında bir hata oluştu!'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Dashboard (Admin girişi gerekli)
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    console.log('[Admin Dashboard] res.locals:', {
        online: res.locals.onlineUsersCount,
        visitor: res.locals.visitorCount
    });
    const blogCount = await Blog.countDocuments();
    const galleryCount = await Gallery.countDocuments();
    const routeCount = await Route.countDocuments();

    const announcementCount = await Announcement.countDocuments();

    const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      title: 'Admin Paneli',
      blogCount,
      galleryCount,
      routeCount,

      announcementCount,
      recentBlogs,
      onlineUsersCount: res.locals.onlineUsersCount || 0,
      visitorCount: res.locals.visitorCount || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

// Blog yönetimi
router.get('/blog', isAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json({ title: 'Blog Yönetimi', blogs });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

router.get('/blog/new', isAdmin, (req, res) => {
  res.json({ title: 'Yeni Blog Yazısı', blog: null });
});

router.get('/blog/edit/:id', isAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send('Blog bulunamadı');
    }
    res.json({ title: 'Blog Düzenle', blog });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

router.post('/blog/save', isAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const { id, title, content, excerpt, city, category, featured } = req.body;
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    if (id) {
      // Güncelleme
      const blog = await Blog.findById(id);
      if (imagePaths.length > 0) {
        blog.images = [...blog.images, ...imagePaths];
      }
      blog.title = title;
      blog.content = content;
      blog.excerpt = excerpt;
      blog.city = city;
      blog.category = category;
      blog.featured = featured === 'on';
      await blog.save();
    } else {
      // Yeni oluşturma
      const blog = new Blog({
        title,
        content,
        excerpt,
        city,
        category,
        images: imagePaths,
        featured: featured === 'on',
        author: req.session.admin._id
      });
      await blog.save();
    }

    res.json({ success: true, message: 'Blog başarıyla kaydedildi.', redirectUrl: '/admin/blog' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sunucu hatası: ' + error.message });
  }
});

router.post('/blog/delete/:id', isAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});

// Galeri yönetimi
router.get('/gallery', isAdmin, async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.json({ title: 'Galeri Yönetimi', galleries });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

router.get('/gallery/new', isAdmin, async (req, res) => {
  try {
    let gallery = null;
    if (req.query.id) {
      gallery = await Gallery.findById(req.query.id);
      if (!gallery) {
        return res.status(404).send('Galeri bulunamadı');
      }
    }
    res.json({ title: gallery ? 'Galeri Düzenle' : 'Yeni Galeri Öğesi', gallery });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

router.post('/gallery/save', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id, title, description, city, category, featured } = req.body;
    
    // Parse location
    let location = { lat: '', lng: '', address: '' };
    try {
        if (req.body.location) {
            location = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
        }
    } catch (e) {
        console.error('Location parsing error:', e);
    }

    if (id) {
      const gallery = await Gallery.findById(id);
      gallery.title = title;
      gallery.description = description;
      gallery.city = city;
      gallery.category = category;
      gallery.location = location; // Update location
      gallery.featured = featured === 'on';
      if (req.file) {
        gallery.image = `/uploads/${req.file.filename}`;
      }
      await gallery.save();
    } else {
      const gallery = new Gallery({
        title,
        description,
        city,
        category,
        image: req.file ? `/uploads/${req.file.filename}` : '',
        featured: featured === 'on',
        location // Add location
      });
      await gallery.save();
    }

    res.json({ success: true, message: 'Galeri öğesi kaydedildi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});

router.post('/gallery/delete/:id', isAdmin, async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Galeri öğesi silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});



// Route yönetimi
router.get('/route', isAdmin, async (req, res) => {
  try {
    let routes = await Route.find()
      .populate('userId', 'username')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    // Map to provide a consistent 'author' field for the frontend
    routes = routes.map(route => ({
      ...route,
      author: route.userId || route.createdBy || { username: 'Admin' }
    }));

    res.json({ title: 'Rota Yönetimi', routes });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

router.post('/route/save', isAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('Route Save Request Body:', req.body);
    console.log('Session Admin:', req.session?.admin);

    const { id, title, description, distance, difficulty, status, city } = req.body;
    
    // Parse location objects (handling potential JSON parsing errors)
    let startLocation, endLocation;
    try {
        startLocation = typeof req.body.startLocation === 'string' ? JSON.parse(req.body.startLocation) : req.body.startLocation;
        endLocation = typeof req.body.endLocation === 'string' ? JSON.parse(req.body.endLocation) : req.body.endLocation;
        
        console.log('Parsed Locations:', { startLocation, endLocation });
    } catch (e) {
        console.error('Location parsing error:', e);
        startLocation = {};
        endLocation = {};
    }

    // Checking if author/createdBy ID exists
    if (!req.session?.admin?._id) {
         console.error('Admin session missing or invalid ID');
         return res.status(401).json({ success: false, error: 'Oturum hatası: Admin girişi yapınız.' });
    }

    // Prepare route object
    const routeData = {
      title,
      description,
      startLocation,
      endLocation,
      distance: distance ? parseFloat(distance) : 0, // Ensure it's a number
      duration: req.body.duration, // Add duration
      difficulty,
      status,
      city,
    };

    if (req.file) {
      console.log('File uploaded:', req.file.filename);
      routeData.image = `/uploads/${req.file.filename}`;
    }

    if (id) {
      await Route.findByIdAndUpdate(id, routeData);
    } else {
      routeData.author = req.session.admin._id; // Set author for new routes
      routeData.createdBy = req.session.admin._id; // Also set createdBy
      console.log('Creating new route with data:', routeData);
      const route = new Route(routeData);
      await route.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Route save error full stack:', error);
    res.status(500).json({ success: false, error: 'Sunucu hatası: ' + error.message });
  }
});


router.post('/route/delete/:id', isAdmin, async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Rota silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});


// Duyuru yönetimi
router.get('/announcement', isAdmin, async (req, res) => {
  try {
    const announcements = await Announcement.find().populate('author', 'username').sort({ startDate: 1 });
    res.json({ title: 'Duyuru Yönetimi', announcements });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

router.get('/announcement/new', isAdmin, async (req, res) => {
  try {
    let announcement = null;
    if (req.query.id) {
      announcement = await Announcement.findById(req.query.id);
      if (!announcement) {
        return res.status(404).send('Duyuru bulunamadı');
      }
    }
    res.json({ title: announcement ? 'Duyuru Düzenle' : 'Yeni Duyuru', announcement });
  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});

router.post('/announcement/save', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id, title, content, city, type, startDate, endDate, location, isActive, isFeatured } = req.body;

    if (id) {
      const announcement = await Announcement.findById(id);
      announcement.title = title;
      announcement.content = content;
      announcement.city = city;
      announcement.type = type;
      announcement.startDate = startDate;
      announcement.endDate = endDate;
      announcement.location = location;
      announcement.isActive = isActive === 'on';
      announcement.isFeatured = isFeatured === 'on';
      if (req.file) {
        announcement.image = `/uploads/${req.file.filename}`;
      }
      await announcement.save();
    } else {
      const announcement = new Announcement({
        title,
        content,
        city,
        type,
        startDate,
        endDate,
        location,
        image: req.file ? `/uploads/${req.file.filename}` : '',
        isActive: isActive === 'on',
        isFeatured: isFeatured === 'on',
        author: req.session.admin._id
      });
      await announcement.save();
    }

    res.json({ success: true, message: 'Duyuru kaydedildi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});

router.post('/announcement/delete/:id', isAdmin, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Duyuru silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});

// Kullanıcı Yönetimi
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ title: 'Kullanıcı Yönetimi', users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
});

router.post('/users/delete/:id', isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Kullanıcı silindi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
});

router.post('/users/role/:id', isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Geçersiz rol.' });
        }
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ success: true, message: 'Kullanıcı rolü güncellendi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
});


module.exports = router;
