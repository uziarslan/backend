// userRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const wrapAsync = require('../utils/Wrapasync');
// user Signup
router.get('/user/signup', wrapAsync(async (req, res) => {
  res.render('./admin/usersignup');
}));
// user Login
router.get('/user/login', wrapAsync(async (req, res) => {
  res.render('./admin/userlogin');
}));
router.post('/user/login', passport.authenticate('user', {
  failureRedirect: '/user/login',
  failureFlash: true
}), (req, res) => {
  req.flash('success', 'Welcome back, user!');
  res.redirect('/admin/home');
});

// Handling the new user request
router.post('/user/signup', wrapAsync(async (req, res, next) => {
  const { email, password, Firstname, Lastname, phone } = req.body;


  const foundUser = await User.findOne({ email });
  if (foundUser) {
    req.flash('error', 'Email already in use. Try a different Email or Login instead.');
    return res.redirect('/user/signup');
  }

  const user = new User({ email, Firstname, Lastname, phone });
  await User.register(user, password);

  req.flash('success', 'Account created successfully. You can now log in.');
  res.redirect('/admin/home');


}));

module.exports = router;
