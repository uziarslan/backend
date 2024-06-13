const mongoose = require('mongoose');

const wholesaleTabSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClothingCategory',
    },
  ],
});

const WholesaleTab = mongoose.model('WholesaleTab', wholesaleTabSchema);

module.exports = WholesaleTab;
