const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    body: String,
    rating: Number
});

module.exports = mongoose.model('Review', ReviewSchema);

/**
 * We are going to connect 1 or more reviews with a campground.
 * so this is a one to many relationship.
 * So what we're going to do is just embed an array of object ids into each campground...
 * the reason is we could theoretically have thousands and thousands of reviews that use 
 * this schema...
 * so it's important that the object id for each of these reviews be embedded within the 
 * main campground schema...
 */