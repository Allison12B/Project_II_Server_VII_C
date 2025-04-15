const AdminUser = require("./models/adminUser");
const express = require('express');
const app = express();
// database connection
const mongoose = require("mongoose");

//Kendall's data base connection 
const db = mongoose.connect("mongodb+srv://kendall14solr:kolerxx12345@reyes.2qxgc.mongodb.net/project_I");

//JWT 
const jwt = require("jsonwebtoken");
const THE_SECRET_KEY = '123JWT';

// parser for the request body (required for the POST and PUT methods)
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Middleware de autenticación JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, THE_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      console.log('Payload:', decoded);
      next();
    });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};


// check for cors
const cors = require("cors");
const { userCreate, /*userGet,*/ userPut, userDelete, userLogin } = require('./controllers/restrictedUserController');
const { adminCreate, adminLogin, adminPinLogin } = require('./controllers/adminUserController');
const { videoCreate, videoDelete, /*getVideoById, videosGet,*/ videoPut/*, getVideoByPlayList*/ } = require("./controllers/videoController");
const { playListCreate, playListDelete, /*playListGetByRestrictedUser,*/ playListPut/*, playListGetByAdminUser*/ } = require('./controllers/playListController');



app.use(cors({
  domains: '*',
  methods: "*"
}));

// Rutas de AdminUser
app.post('/api/adminUser', adminCreate);
app.post('/api/adminUserLogin', adminLogin);
app.post('/api/adminUserPin/:adminId', adminPinLogin);

// Rutas de RestrictedUser
app.post('/api/restrictedUser', authenticateJWT, userCreate);
app.post('/api/restrictedUserLogin/:profileId', authenticateJWT, userLogin);
app.put('/api/restrictedUser/:id', authenticateJWT, userPut);
app.delete('/api/restrictedUser/:id', authenticateJWT, userDelete);

// Rutas de Playlist
app.post('/api/playList/create/:id', authenticateJWT, playListCreate);
app.delete('/api/playList/:id', authenticateJWT, playListDelete);
app.put('/api/playList/:id', authenticateJWT, playListPut);

// Rutas de Videos
app.post('/api/video', authenticateJWT, videoCreate);
app.delete('/api/video/:id', authenticateJWT, videoDelete);
app.put('/api/video/:id', authenticateJWT, videoPut);

app.listen(3001, () => console.log("Example app listening on port 3001!"));
