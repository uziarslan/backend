// navbar.js
const mongoose = require('mongoose');

const navbarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clothingCategory"
    }
  ]
});

const Navbar = mongoose.model('Navbar', navbarSchema);

module.exports = Navbar;
