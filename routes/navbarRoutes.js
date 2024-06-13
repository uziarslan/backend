// navbarRoutes.js
const express = require("express");
const mongoose = require('mongoose');
const router = express();
const { isLoggedin } = require('../middleware/index');

const Navbar = mongoose.model('Navbar');
const ClothingCategory = mongoose.model('clothingCategory');
const wrapAsync = require('../utils/Wrapasync');

// Navbar Get Route
router.get("/admin/navbar", isLoggedin,wrapAsync( async (req, res) => {
  
    const navbars = await Navbar.find({});
    const categories = await ClothingCategory.find({}); 

    res.render('./admin/navbar', { navbars, categories }); 
 
}));


// Navbar Post Route
router.post('/admin/navbar', isLoggedin, wrapAsync(async (req, res) => {
  const { navbar, selectedCategories } = req.body;

  // Check if the maximum limit of 3 navbars has been reached
  const currentNavbarCount = await Navbar.countDocuments();
  if (currentNavbarCount >= 3) {
    req.flash('error', 'You can only add a maximum of 3 navbars.');
    return res.redirect('/admin/navbar');
  }

  const newNavbar = new Navbar({ name: navbar });

  const categories = await ClothingCategory.find({ _id: { $in: selectedCategories } });
  newNavbar.categories = categories.map(cat => cat._id);

  const savedNavbar = await newNavbar.save();

  req.flash('success', 'Navbar has been added!');
  res.redirect('/admin/navbar');
}));

// Navbar Edit Route (GET)
router.get('/admin/navbar/edit/:id', isLoggedin, wrapAsync(async (req, res) => {
  const { id } = req.params;

  
    const navbar = await Navbar.findById(id);
    const categories = await ClothingCategory.find({}); 

    res.render('./admin/editNavbar', { navbar, categories }); 
  
}));

// Navbar Update Route (PUT)
router.put('/admin/navbar/edit/:id', isLoggedin, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { navbar, selectedCategories } = req.body;

  
    // Find the existing navbar by ID
    const existingNavbar = await Navbar.findById(id);

    // Update the navbar's name
    existingNavbar.name = navbar;

    // Get the selected categories and update the navbar's categories array
    const categories = await ClothingCategory.find({ _id: { $in: selectedCategories } });
    existingNavbar.categories = categories.map(cat => cat._id);

    await existingNavbar.save();

    req.flash('success', 'Navbar has been updated!');
    res.redirect('/admin/navbar');
  
}));
// Navbar View Categories Route
router.get('/admin/navbar/:id', isLoggedin, wrapAsync(async (req, res) => {
  const { id } = req.params;


    // Find the navbar by ID
    const navbar = await Navbar.findById(id).populate('categories');

    if (!navbar) {
      req.flash('error', 'Navbar not found!');
      return res.redirect('/admin/navbar');
    }

    res.render('./admin/navbarviewCategories', { navbar }); // Pass 'navbar' to the view

}));

// Navbar Delete Route
router.delete('/admin/navbar/delete/:id', isLoggedin, wrapAsync(async (req, res) => {
  const { id } = req.params;

  
    // Find the navbar by ID
    const navbar = await Navbar.findById(id);

    if (!navbar) {
      req.flash('error', 'Navbar not found!');
      return res.redirect('/admin/navbar');
    }

    // Remove the navbar from associated categories' navbar array
    const categories = await ClothingCategory.find({ _id: { $in: navbar.categories } });
    categories.forEach(async (category) => {
      category.navbars.pull(id);
      await category.save();
    });

    // Delete the navbar
    await Navbar.findByIdAndDelete(id);

    req.flash('success', 'Navbar has been deleted!');
    res.redirect('/admin/navbar');
 
}));
router.get("/navbar/home", isLoggedin, wrapAsync(async (req, res) => {
  try {
    const navbars = await Navbar.find({});
    const categories = await ClothingCategory.find({}); 
    res.render('./admin/userlogin', { navbars , categories }); // Render the admin home template
  } catch (error) {
    console.error('Error fetching home page:', error);
    res.status(500).send('Internal Server Error');
  }
}));

module.exports = router;
