// Hata kontrolü için yardımcı script
console.log('=== Proje Kontrolü ===\n');

// 1. Node modülleri kontrolü
console.log('1. Node modülleri kontrol ediliyor...');
try {
  require('express');
  require('mongoose');
  require('ejs');
  require('express-session');
  require('connect-mongo');
  require('slugify');
  require('csurf');
  require('cookie-parser');
  require('multer');
  require('bcryptjs');
  require('dotenv');
  console.log('✓ Tüm modüller yüklü\n');
} catch (err) {
  console.log('✗ Eksik modül:', err.message);
  console.log('Çözüm: npm install komutunu çalıştırın\n');
}

// 2. Dosya yapısı kontrolü
console.log('2. Dosya yapısı kontrol ediliyor...');
const fs = require('fs');
const path = require('path');

const requiredDirs = ['../routes', '../models', '../views', '../public', '../middleware', '../config'];
const requiredFiles = ['../server.js', '../package.json'];

let allOk = true;

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`✗ Klasör eksik: ${dir}`);
    allOk = false;
  }
});

requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`✗ Dosya eksik: ${file}`);
    allOk = false;
  }
});

if (allOk) {
  console.log('✓ Tüm klasörler ve dosyalar mevcut\n');
}

// 3. .env dosyası kontrolü
console.log('3. .env dosyası kontrol ediliyor...');
if (fs.existsSync('../.env')) {
  console.log('✓ .env dosyası mevcut\n');
} else {
  console.log('✗ .env dosyası bulunamadı');
  console.log('Çözüm: .env.example dosyasını kopyalayıp .env olarak kaydedin\n');
}

// 4. MongoDB bağlantı kontrolü
console.log('4. MongoDB bağlantı bilgileri kontrol ediliyor...');
require('dotenv').config({ path: '../.env' });
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/turizm-platformu';
console.log(`MongoDB URI: ${mongoUri}`);
console.log('Not: MongoDB\'nin çalıştığından emin olun\n');

// 5. Port kontrolü
console.log('5. Port kontrolü...');
const port = process.env.PORT || 3000;
console.log(`Port: ${port}\n`);

console.log('=== Kontrol Tamamlandı ===');
console.log('\nEğer hata alıyorsanız:');
console.log('1. npm install komutunu çalıştırın');
console.log('2. .env dosyasını oluşturun');
console.log('3. MongoDB\'nin çalıştığından emin olun');
console.log('4. node server.js komutuyla sunucuyu başlatın');
