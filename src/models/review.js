const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  postedOn: {
    type: Date
  },
  rating: {
    required: true,
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  }
});


const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
