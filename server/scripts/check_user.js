const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
require('dotenv').config({ path: '../.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/turizm-platformu', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('--- Kullanıcı Kontrolü ---');
    
    // Check for 'emre' (from screenshot)
    const usernameToCheck = 'emre';

    const user = await User.findOne({ username: usernameToCheck });
    const admin = await Admin.findOne({ username: usernameToCheck });

    console.log(`User '${usernameToCheck}' found:`, user ? 'YES' : 'NO');
    if (user) console.log('User Role:', user.role || 'user');

    console.log(`Admin '${usernameToCheck}' found:`, admin ? 'YES' : 'NO');
    
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
