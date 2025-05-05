// models/adminUser.js
const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    pin: { type: Number, required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    country: { type: String, required: true },
    dateBirth: { type: String, required: true },
    code: { type: Number},
    codeExpire: { type: Date},
    state: { type: String, enum: ['Pending', 'Active'], default: 'Pending' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String }
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
