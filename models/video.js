const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Atributes of the video collection
const video = new Schema({
    name: { type: String, required: true }, 
    url: { type: String, required: true }, 
    description: { type: String, default: "" },
    playLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlayList', default: [] }],
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
});

//Exports the model on our data base and create a new collection 
module.exports = mongoose.model('Video', video);