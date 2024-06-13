const express = require('express');
const router = express.Router();
const { isLoggedin } = require('../middleware/index');
const WholesaleTab = require('../models/wholesaleTab');
const ClothingCategory = require('../models/clothingCategory');
const wrapAsync = require('../utils/Wrapasync');
// Wholesale Tab Get Route
router.get('/admin/wholesaletabs', isLoggedin, wrapAsync( async (req, res) => {
 
    const wholesaleTabs = await WholesaleTab.find({});
    const categories = await ClothingCategory.find({}); // Fetch the categories from the database
    res.render('./admin/wholesaleTabs', { wholesaleTabs, categories }); // Pass both 'wholesaleTabs' and 'categories' to the view
 
}));

// Wholesale Tab Post Route
router.post('/admin/wholesaletabs', isLoggedin,wrapAsync( async (req, res) => {
  const { name, content, selectedCategories } = req.body;

  
    const newWholesaleTab = new WholesaleTab({ name, content });
    const categories = await ClothingCategory.find({ _id: { $in: selectedCategories } });
    newWholesaleTab.categories = categories.map(cat => cat._id);

    await newWholesaleTab.save();
    req.flash('success', 'Wholesale tab has been added!');
    res.redirect('/admin/wholesaletabs');
  
}));
// Wholesale Tab Edit Route (GET)
router.get('/admin/wholesaletabs/edit/:id', isLoggedin,wrapAsync( async (req, res) => {
  const { id } = req.params;

  
    const wholesaleTab = await WholesaleTab.findById(id);
    const categories = await ClothingCategory.find({}); // Fetch the categories from the database

    res.render('./admin/editwholesaletab', { wholesaleTab, categories }); // Pass 'categories' to the view
 
}));

// Wholesale Tab Update Route (PUT)
router.put('/admin/wholesaletabs/edit/:id', isLoggedin, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { name, content, selectedCategories } = req.body;

  
    // Find the existing wholesale tab by ID
    const existingWholesaleTab = await WholesaleTab.findById(id);

    // Update the wholesale tab's name and content
    existingWholesaleTab.name = name;
    existingWholesaleTab.content = content;

    // Get the selected categories and update the wholesale tab's categories array
    const categories = await ClothingCategory.find({ _id: { $in: selectedCategories } });
    existingWholesaleTab.categories = categories.map(cat => cat._id);

    await existingWholesaleTab.save();

    req.flash('success', 'Wholesale tab has been updated!');
    res.redirect('/admin/wholesaletabs');

}));
// Wholesale Tab Delete Route
router.delete('/admin/wholesaletabs/delete/:id', isLoggedin,wrapAsync( async (req, res) => {
  const { id } = req.params;

  
    await WholesaleTab.findByIdAndDelete(id);
    req.flash('success', 'Wholesale tab has been deleted!');
    res.redirect('/admin/wholesaletabs');
 
}));

module.exports = router;
