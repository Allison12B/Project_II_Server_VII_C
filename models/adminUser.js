const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Atributes of the adminUser collection
const adminUser = new Schema({
    email: { type: String },
    password: { type: String },
    phoneNumber: {type: Number },
    pin: { type: Number },
    name: { type: String },
    lastName: { type: String },
    age: { type: Number },
    country: { type: String },
    dateBirth: { type: String }
});

//Exports the model on our data base and create a new collection 
module.exports = mongoose.model('AdminUser', adminUser);