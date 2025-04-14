const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Atributos de la colección PlayList
const playList = new Schema({
    name: { type: String, required: true }, 
    restrictedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RestrictedUsers' }],
    adminId: {type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true
    }
});

// Export the model in the database
module.exports = mongoose.model('PlayList', playList);