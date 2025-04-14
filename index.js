const express = require('express');
const app = express();
// database connection
const mongoose = require("mongoose");

//Kendall's data base connection 
const db = mongoose.connect("mongodb+srv://kendall14solr:kolerxx12345@reyes.2qxgc.mongodb.net/project_I");

// parser for the request body (required for the POST and PUT methods)
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// check for cors
const cors = require("cors");
const {userCreate, userGet, userPut, userDelete, userLogin} = require('./controllers/restrictedUserController');
const {adminCreate, adminLogin, adminPinLogin} = require('./controllers/adminUserController');
const {videoCreate, videoDelete, getVideoById, videosGet, videoPut, getVideoByPlayList} = require("./controllers/videoController");
const {playListCreate, playListDelete, playListGetByRestrictedUser, playListPut, playListGetByAdminUser} = require('./controllers/playListController');



app.use(cors({
  domains: '*',
  methods: "*"
}));

//AdminUser's methods
app.post('/api/adminUser', adminCreate);
app.post('/api/adminUserLogin', adminLogin);
app.post('/api/adminUserPin/:adminId', adminPinLogin);

//RestrictedUser's methods
const { userGetById } = require('./controllers/restrictedUserController');

app.post('/api/restrictedUser', userCreate);
app.get('/api/restrictedUser/adminUser/:id', userGet);
app.get('/api/restrictedUser/:id', userGetById);
app.put('/api/restrictedUser/:id', userPut);
app.delete("/api/restrictedUser/:id", userDelete);
app.post('/api/restrictedUserLogin/:profileId', userLogin);

//Methods of playlist
app.post('/api/playList/create/:id', playListCreate);
app.delete('/api/playList/:id', playListDelete);
app.get('/api/playList/retrictedUser/:id', playListGetByRestrictedUser);
app.put('/api/playList/:id', playListPut);
app.get('/api/playList/adminUser/:id', playListGetByAdminUser);



//Methods of videos
app.post('/api/video', videoCreate);
app.delete("/api/video/:id", videoDelete);
app.get("/api/video/:id", getVideoById);
app.get("/api/video", videosGet);
app.put("/api/video/:id", videoPut);
app.get('/api/video/playList/:id', getVideoByPlayList);


app.listen(3001, () => console.log("Example app listening on port 3001!"));
