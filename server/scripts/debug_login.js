const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
const readline = require('readline');
require('dotenv').config({ path: '../.env' });

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/turizm-platformu', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (str) => new Promise(resolve => rl.question(str, resolve));

const debugLogin = async () => {
    try {
        console.log('\n--- Login Debug Aracı ---');
        
        const username = await question('Giriş yapmaya çalıştığınız Kullanıcı Adı: ');
        const password = await question('Şifre: ');

        console.log(`\n1. "${username}" aranıyor...`);

        // 1. User Kontrolü
        let user = await User.findOne({ username });
        let isAdmin = false;

        if (user) {
            console.log('BULUNDU: Normal Kullanıcı tablosunda bulundu.');
        } else {
            console.log('BULUNAMADI: Normal Kullanıcı tablosunda yok.');
            
            // 2. Admin Kontrolü
            console.log('2. Admin tablosunda aranıyor...');
            const admin = await Admin.findOne({ username });
            if (admin) {
                console.log('BULUNDU: Admin tablosunda bulundu.');
                user = admin;
                isAdmin = true;
            } else {
                console.log('BULUNAMADI: Admin tablosunda da yok.');
                console.error('SONUÇ: Kullanıcı adı sistemde kayıtlı değil.');
                process.exit(0);
            }
        }

        // 3. Şifre Kontrolü
        console.log('3. Şifre kontrol ediliyor...');
        const isMatch = await user.comparePassword(password);

        if (isMatch) {
            console.log('BAŞARILI: Şifre doğru.');
            console.log('Rol:', isAdmin ? 'ADMIN' : 'USER');
            console.log('Giriş testi başarılı. Backend kodunda sorun olabilir.');
        } else {
            console.log('HATA: Şifre yanlış!');
            console.log('Veritabanındaki Hash:', user.password);
            console.log('Girdiğiniz şifre eşleşmiyor.');
        }

    } catch (error) {
        console.error('Bir hata oluştu:', error);
    } finally {
        rl.close();
        mongoose.connection.close();
    }
};

debugLogin();
