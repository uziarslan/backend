const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  itemNumber: {
    type: String,
    required: true,
    unique: true,
  },
  productTitle: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  msrp: {
    type: String,
    required: true,
  },
  images: [
    {
      filename: String,
      path: String
    },
  ],
  sizes: [
    {
      type: String,
    },
  ],
  sizeRatio: [ {
    type: Number,
    default: 1,
  },
],
  color: [
   {
    type: String,
    required: true,
  },
],
  casePack: [
    {
    type: Number,
    required: true,
  },
],

  upc: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
   
  },
  inventory:
  [ {
    type: String,
    default: 0,
  }
  ],
  isNewArrival: {
    type: Boolean,
    default: false,
},
isTrending: {
    type: Boolean,
    default: false,
},
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
