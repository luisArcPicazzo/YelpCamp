/**
 * When a router is created, params are divided, and cannot access other 
 * params with other files (eg. campground id within of the calling campgrounds.js)
 * so we need to pass the option { mergeParams: true } to the express.Router() 
 * function as an argument that way if using path: /campgrounds/:id/reviews/:reviewsId 
 * which involves looking for both :camgroundsId and :reviewsId;, given the path. 
 * reviews.js is dependen on campgound's id path, thus we need to use the parameter here.
 * sin campgrounds.js does note use any id from reviews, campgrounds.js does not need to 
 * pass the optional argument
 */
const express = require('express');
const router = express.Router({ mergeParams: true }); 
const catchAsync = require('../utils/CatchAsync');
const campground = require('../models/campground');
const review = require('../models/review');
const { isLoggedIn, joiValidateReview, isReviewAuthor } = require('../middleware');


router.post('/', isLoggedIn, joiValidateReview, catchAsync(async(req, res)=> {
    const campGrndById = await campground.findById(req.params.id);
    const campgrndReview = new review(req.body.newCampgroundReview);
    campgrndReview.author = req.user._id; // associate the logged in user as author to the newly created review
    campGrndById.reviews.push(campgrndReview);
    await campgrndReview.save();
    await campGrndById.save();
    req.flash('flashMsgSuccess', 'Review submitted!'); // make sure you display this info in the template (ejs)
    res.redirect(`/campgrounds/${campGrndById._id}`);
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req, res)=> { // delete the one object ID that corresponds to review
    /**
     * ---- $pull -----Mongo Operator-------
     * The $pull operator REMOVES from an existing array all instances of 
     * a value or values that match a specified condition.
     * 
     * we still have a reference to the review within the array of object id's 
     * that we have to get rid of from the campground array.
     *
     * So you want to find that campgroundId and get rid of that one review ref
     * from within campground. but nothing more...
     * so the next operation in line 185 says the following;
     * 
     * Go to the campground id, within the reviews array located @ that campground Id, 
     * REMOVE ($pull) that reviewId reference.
    */
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } } );
    await review.findByIdAndDelete(reviewId);
    req.flash('flashMsgSuccess', 'Review successfully deleted!'); // make sure you display this info in the template (ejs)
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;