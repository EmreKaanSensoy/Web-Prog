// İlk admin kullanıcısını oluşturmak için script
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const readline = require('readline');
require('dotenv').config({ path: '../.env' });

async function createAdmin() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/turizm-platformu', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB bağlantısı başarılı');

    // Admin kontrolü
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut!');
      process.exit(0);
    }

    // Yeni admin oluştur
    const admin = new Admin({
      username: 'admin',
      password: 'admin123', // Otomatik hash'lenecek
      email: 'admin@example.com',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('Kullanıcı adı: admin');
    console.log('Şifre: admin123');
    console.log('LÜTFEN GİRİŞ YAPTIKTAN SONRA ŞİFRENİZİ DEĞİŞTİRİN!');
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

createAdmin();
