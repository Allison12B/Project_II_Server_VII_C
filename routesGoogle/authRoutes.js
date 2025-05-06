import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  if (req.user) {
    console.log('Usuario autenticado:', req.user);
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`/profileComplete.html?Token=${token}`);
  } else {
    res.redirect('/');
  }
});


export default router;
