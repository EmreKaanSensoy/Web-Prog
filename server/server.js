const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
require('dotenv').config();
const SiteStats = require('./models/SiteStats');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/turizm-platformu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    // Initialize stats
    SiteStats.findOne().then(stats => {
      if (stats) {
        visitorCount = stats.visitorCount;
        console.log('------------------------------------------------');
        console.log('✅ VERİTABANI BAĞLANDI | AÇILIŞ ZİYARETÇİ SAYISI:', visitorCount);
        console.log('------------------------------------------------');
      } else {
        new SiteStats({ visitorCount: 0 }).save();
        console.log('Yeni istatistik kaydı oluşturuldu.');
      }
    }).catch(err => console.error('Stats load error:', err));
  })
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'turizm-platform-secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/turizm-platformu'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 saat
    httpOnly: true,
    secure: false // Production'da true yapılmalı (HTTPS)
  }
}));

// Debug Middleware (Geçici)
app.use((req, res, next) => {
  // console.log('Request:', req.method, req.path);
  // console.log('Session ID:', req.sessionID);
  // console.log('Session:', req.session);
  // console.log('Body:', req.body);
  next();
});

// CSRF Protection
const csrfProtection = csrf({ cookie: true }); // Enable cookie support for spa

// CSRF Middleware
app.use(csrfProtection);

// CSRF Token Endpoint for React Client
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// CSRF token'ı view'lere ekle
app.use((req, res, next) => {
  res.locals.session = req.session;
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (err) {
    res.locals.csrfToken = '';
  }
  next();
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Online Users Tracking
let onlineUsers = new Map(); // sessionId -> lastSeen timestamp
let visitorCount = 0;

// Online kullanıcıları temizle (her 1 dakikada bir)
setInterval(() => {
  const now = Date.now();
  const timeout = 60000; // 1 dakika
  for (const [sessionId, lastSeen] of onlineUsers.entries()) {
    if (now - lastSeen > timeout) {
      onlineUsers.delete(sessionId);
    }
  }
}, 30000); // Her 30 saniyede bir kontrol et

app.use(async (req, res, next) => {
  // Ziyaretçi sayacı
  console.log('DEBUG: Session Visited?', req.session.visited, 'ID:', req.sessionID);
  
  if (!req.session.visited) {
    req.session.visited = true;
    
    // DB'de artır ve yerel değişkeni güncelle
    try {
      const stats = await SiteStats.findOneAndUpdate({}, { $inc: { visitorCount: 1 } }, { new: true, upsert: true });
      visitorCount = stats.visitorCount;
      console.log('✅ Ziyaretçi artırıldı. Yeni sayı:', visitorCount);
    } catch (err) {
      console.error('Stats update error:', err);
    }
  }

  // Online kullanıcı takibi - session ID'yi kullan
  if (req.sessionID) {
    onlineUsers.set(req.sessionID, Date.now());
  }

  // Aktif online kullanıcı sayısını hesapla (son 1 dakika içinde aktif olanlar)
  const now = Date.now();
  const activeUsers = Array.from(onlineUsers.values()).filter(
    lastSeen => (now - lastSeen) < 60000
  ).length;

  console.log(`[Stats Debug] Visitor: ${visitorCount} | Online: ${activeUsers} | SessionID: ${req.sessionID}`);

  res.locals.onlineUsersCount = activeUsers;
  res.locals.visitorCount = visitorCount;

  next();
});

// Routes
const indexRoutes = require('./routes/index');
const blogRoutes = require('./routes/blog');
const galleryRoutes = require('./routes/gallery');
const routeRoutes = require('./routes/route');
const adminRoutes = require('./routes/admin');
const announcementRoutes = require('./routes/announcement');
const authRoutes = require('./routes/auth');

app.use('/', indexRoutes);
app.use('/blog', blogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/route', routeRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/announcements', announcementRoutes);

// Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF Error:', err);
    res.status(403).send('CSRF token hatası! Lütfen sayfayı yenileyip tekrar deneyin.');
    return;
  }
  console.error(err.stack);
  res.status(500).json({ error: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
