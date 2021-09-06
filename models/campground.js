/**
 * Need to define a Schema in order to define a model 
 * schema -> mapping of mongo keys to types in js
 *          Attribute to type blueprint.
 *  
 * After defining the schema, you tell mongoose to make a model using 
 */

const mongoose = require('mongoose');

const CampgroundSchema = new mongoose.Schema ({
    title: String, // shorthand of {type: String}
    image: String,
    price: Number,
    description: String,
    location: String
});

module.exports = mongoose.model('Campground', CampgroundSchema);

