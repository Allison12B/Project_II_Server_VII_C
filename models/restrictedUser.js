const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Atributos de la colección restrictedUser
const restrictedUser = new Schema({
  name: { type: String },
  age: {type: Number },
  pin: { type: Number },
  avatar: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
});

//Export the model in the data base
module.exports = mongoose.model('RestrictedUsers', restrictedUser);