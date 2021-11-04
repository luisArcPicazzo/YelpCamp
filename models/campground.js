/**
 * Need to define a Schema in order to define a model 
 * schema -> mapping of mongo keys to types in js
 *          Attribute to type blueprint.
 *  
 * After defining the schema, you tell mongoose to make a model using 
 */

const mongoose = require('mongoose');
const review = require('./review');

const ImageSchema = new mongoose.Schema({
    /** Created a separate imageSchema in order to make virtual 
     * cloudinary thumbnails and not load the whole image. 
     * needs to assign a special url per image in order to 
     * affect the size... (cloudinary's transformation API)
     * finally; this schema embeds into "CampgroundSchema"
     */
    url: String,     // stores cloudinary's path
    filename: String // stores coudinary's filename
});

/** the virtual property makes it look as if this modified url 
 * were stored in the database, but it is actually not. Though still 
 * makes it work and look as if it were. This is useful.
 */
ImageSchema.virtual('thumbnail').get(function(){ // 'thumbnail' is how you've called the property. That is; the property to be called elsewhere (edit.ejs in this case)
                                                 // what it does: on every image I wanna set up a thumbnail, with a callback function referring to a particuilar image.
    return this.url.replace('/upload', '/upload/c_crop,h_200,w_300'); // modify the url in order to "trim" the image being requested / displayed.
});

const CampgroundSchema = new mongoose.Schema ({
    title: String, // shorthand of {type: String}
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    /**
     * create an array to store the id's belonging to 
     * the reviews' schema. Thus we've made feasible a one to many 
     * relationship between the campground -> review schemas (dbs).
     */
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId, // an array of object ids.
            ref: 'Review' // Defines a reference towards the review's schema.
        }
    ]
}, { toJSON: { virtuals: true } } ); // toJSON virtuals true -> tells mongoose to add to the schema virtual properties of JSON.Strigified objects.. (used for mapbox cluster map in this case...)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    //return "I AM POPUP TEXT!!!";
    return `<a href="/campgrounds/${this._id}">${this.title}</a>
            <p>${this.description.substring(0,100)}...</p>`;
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

