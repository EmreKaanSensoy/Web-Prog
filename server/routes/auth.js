const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');

// Register Page
router.get('/register', (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    res.json({
        title: 'Kayıt Ol',
        user: req.session.user,
        csrfToken: req.csrfToken()
    });
});

// Register Logic
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Bu kullanıcı adı veya e-mail zaten kayıtlı.' });
        }

        // Create user
        const user = new User({ username, email, password });
        await user.save();

        // Login automatically
        req.session.user = user;
        res.json({ success: true, user, role: 'user' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Kayıt sırasında bir hata oluştu.' });
    }
});

// Get Current User (Me)
router.get('/me', async (req, res) => {
    try {
        if (req.session.user || req.session.admin) {
            const userData = req.session.user || req.session.admin;
            // Optionally fetch fresh data from DB if session is stale
            // For now return session data
            res.json({ success: true, user: userData });
        } else {
            res.status(401).json({ success: false, error: 'Oturum açılmamış.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
});

// Login Page (API doesn't need GET /login, but keeping for compatibility if direct access?)
router.get('/login', (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    // API client handles UI
    res.status(200).send('Login endpoint');
});

// Login Logic
router.post('/login', async (req, res) => {
    console.log('--- LOGIN REQUEST RECEIVED ---');
    console.log('Body:', req.body);
    try {
        const { username, password } = req.body;
        console.log(`Attempting login for: ${username}`);

        // First check User
        let user = await User.findOne({ username });
        console.log('User found in User collection:', user ? 'YES' : 'NO');
        
        let isAdmin = false;

        if (!user) {
            // Check Admin if user not found
            const admin = await Admin.findOne({ username });
            if (admin) {
                user = admin;
                isAdmin = true;
            }
        }

        if (!user) {
            return res.status(401).json({ success: false, error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        // Set Session
        if (isAdmin) {
            req.session.admin = user;
        } else {
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role // Add role to session
            };
            
            // If user has admin role, also set admin session
            if (user.role === 'admin') {
                req.session.admin = req.session.user;
                isAdmin = true; // Update local flag for response
            }
        }

        res.json({ success: true, user, role: isAdmin ? 'admin' : 'user' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Giriş sırasında bir hata oluştu.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Update Profile
router.put('/update-profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor.' });
        }
        
        const { username, email, avatar } = req.body;
        const userId = req.session.user._id;

        // Check unique
        const existing = await User.findOne({ 
            $or: [{ username }, { email }],
            _id: { $ne: userId }
        });

        if (existing) {
            return res.status(400).json({ success: false, error: 'Kullanıcı adı veya e-posta kullanımda.' });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            username, email, avatar
        }, { new: true });

        // Update session
        req.session.user = {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            avatar: updatedUser.avatar
        };

        res.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Güncelleme hatası.' });
    }
});

// Change Password
router.put('/change-password', async (req, res) => {
    try {
        if (!req.session.user) {
             return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor.' });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.session.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ success: false, error: 'Mevcut şifre yanlış.' });

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Şifke değiştirildi.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Hata oluştu.' });
    }
});

module.exports = router;
