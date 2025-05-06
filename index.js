require('dotenv').config();
const express = require('express');
const app = express();

/*const passport = require('passport'); 
const session = require('express-session');
require('./middlewareGoogle/passport');
require('./routesGoogle/authRoutes');*/

//Kendall's data base connection 
const mongoose = require("mongoose");
const db = mongoose.connect("mongodb+srv://kendall14solr:kolerxx12345@reyes.2qxgc.mongodb.net/project_I");

//JWT 
const jwt = require("jsonwebtoken");
const THE_SECRET_KEY = process.env.THE_SECRET_KEY;

// parser for the request body (required for the POST and PUT methods)
const bodyParser = require("body-parser");
app.use(bodyParser.json());

/**
app.use(express.json());
app.use(session({ secret: 'sessionsecret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use(express.static(path.join(__dirname, 'client')));
*/

//Cheack for cors
const cors = require("cors");
app.use(cors({
  domains: '*',
  methods: "*"
}));

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
      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};


const { userCreate, userPut, userDelete, userLogin } = require('./controllers/restrictedUserController');
const { adminCreate, adminLogin, adminPinLogin, verifyEmail, verifyLoginCode } = require('./controllers/adminUserController');
const { videoCreate, videoDelete, videoPut, searchYouTube } = require("./controllers/videoController");
const { playListCreate, playListDelete, playListPut } = require('./controllers/playListController');

// Rutas de AdminUser
app.post('/api/adminUser', adminCreate);
app.get('/api/verify', verifyEmail);
app.post('/api/adminUserLogin', adminLogin);
app.post('/api/adminUserVerifyCode', verifyLoginCode);
app.post('/api/adminUserPin/:adminId', adminPinLogin);

//RUtas de Google
/*app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});*/

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
app.post('/api/buscarVideo', authenticateJWT, searchYouTube);

app.listen(3001, () => console.log("Example app listening on port 3001!"));
