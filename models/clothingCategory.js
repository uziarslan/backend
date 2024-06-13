const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Add this line to import Schema

const clothingCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  ],
  navbars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Navbar'
    }
  ]
});

const ClothingCategory = mongoose.model('clothingCategory', clothingCategorySchema);

module.exports = ClothingCategory;
