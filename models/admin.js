const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
});
// Add passport-local-mongoose plugin to handle authentication
adminSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Admin', adminSchema);
 
