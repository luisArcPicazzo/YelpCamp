/**
 * Need to define a Schema in order to define a model 
 * schema -> mapping of mongo keys to types in js
 *          Attribute to type blueprint.
 *  
 * After defining the schema, you tell mongoose to make a model using 
 */

const mongoose = require('mongoose');
const review = require('./review');

const CampgroundSchema = new mongoose.Schema ({
    title: String, // shorthand of {type: String}
    image: String,
    price: Number,
    description: String,
    location: String,
    /**
     * create an array to store the id's belonging to 
     * the reviews' schema. Thus we've made feasible a one to many 
     * relationship between the campground -> review schemas (dbs).
     */
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId, // an array of object ids.
            ref: 'Review' // Defines a reference towards the review's schema.
        }
    ]
});

/**
 * ------ Mongoose Middleware --------
 * Deletes all posted reviews associated with one campground
 * when said campground has been deleted...
 * Lecture 469 Section 46 Colt Steele's udemy course
 * Check again for further reference cause it's tricky
 */
CampgroundSchema.post('findOneAndDelete', async function (doc) { // after it's been deleted... run this middleware
    if (doc) {
        await review.deleteMany({
            _id: { $in: doc.reviews } 
        })
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);

