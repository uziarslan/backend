// adminRoutes.js

const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');
const wrapAsync = require('../utils/Wrapasync');
// Admin Signup
router.get('/admin/signup', wrapAsync(async (req, res) => {
  res.render('./admin/signup');
}));;
// Admin Login
router.get('/admin/login', wrapAsync(async (req, res) => {
  res.render('./admin/login');
}));;
router.post('/admin/login', passport.authenticate('admin', {
  failureRedirect: '/admin/login',
  failureFlash: true
}), (req, res) => {
  req.flash('success', 'Welcome back, admin!');
  res.redirect('/admin/category');
});

// Handling the new user request
router.post('/admin/signup', wrapAsync(async (req, res, next) => {
  const { username, password } = req.body;

  const foundUser = await Admin.find({ username });
  if (foundUser.length) {
    // Setup flash and call it here
    req.flash('error', 'Email already in use. Try different Email or Login instead.')
    return res.redirect('/admin/signup')
  }
  const admin = new Admin({ ...req.body });
  const registeredUser = await Admin.register(admin, password, function (err, newUser) {
    if (err) {
      next(err);
    }
    req.logIn(newUser, () => {
      res.redirect('/admin/category');
    })
  });
}));

module.exports = router;
