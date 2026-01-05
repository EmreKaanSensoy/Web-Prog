// Admin yetkilendirme middleware'i
const User = require('../models/User');

const isAdmin = async (req, res, next) => {
  console.log('--- isAdmin Middleware ---');
  
  // Durum 1: Zaten admin oturumu var (Admin veya admin rolüne sahip kullanıcı girişi)
  if (req.session && req.session.admin) {
    console.log('Access GRANTED: Session has admin');
    return next();
  }

  // Durum 2: Kullanıcı oturumu var, veritabanında rolü admin mi diye kontrol et
  if (req.session && req.session.user) {
    try {
        const user = await User.findById(req.session.user._id);
        if (user && user.role === 'admin') {
            req.session.admin = user; // Oturumu yükselt
            // Kullanıcı oturumunu da güncel tut
             req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            };
            req.session.save(); // Oturumun kaydedildiğinden emin ol
            console.log('Access GRANTED: User promoted to Admin dynamic check');
            return next();
        }
    } catch (err) {
        console.error('isAdmin Middleware DB Error:', err);
    }
  }

  console.log('Access DENIED: User is NOT Admin');
  res.redirect('/admin/login');
};

module.exports = { isAdmin };
