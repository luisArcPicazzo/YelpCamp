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

//#region ****** I N C L U D E S *******
const express = require('express');
const router = express.Router({ mergeParams: true }); 
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, joiValidateReview, isReviewAuthor } = require('../middleware');
const ctrllrReviews = require('../controllers/reviews');
//#endregion


router.post('/', isLoggedIn, joiValidateReview, catchAsync(ctrllrReviews.createReview));
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(ctrllrReviews.deleteReview));



module.exports = router;