const expressError = require('./utils/ExpressError');
const { joiCampgroundSchema, joiReviewSchema } = require('./joiValidationSchemas');
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {// passport's helper function 
        req.session.returnTo = req.originalUrl;
        req.flash('flashMsgError', 'You must sign in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.joiValidateInput = (req, res, next) => {
    const { error } = joiCampgroundSchema.validate(req.body);
    if(error) {
        /**
         * If error is found. then map over the "error.details" array 
         * in order to make a single string message. Then take that newly created 
         * string message and pass it to a "new ExpressError" instance and throw it as 
         * an exception...
         */
        const joiValidationError = error.details.map(el => el.message).join(',');
        throw new expressError(joiValidationError, 400);
//        throw new ExpressError(joiValidationError, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campgroundById = await Campground.findById(id);
    if (!campgroundById.author.equals(req.user._id)) {
        req.flash('flashMsgError', 'You must be the author of this item to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.joiValidateReview = (req, res, next) => {
    const { error } = joiReviewSchema.validate(req.body);
    if(error) {
        const joiValidationError = error.details.map(el => el.message).join(',');
        throw new expressError(joiValidationError, 400);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const reviewById = await Review.findById(reviewId);
    if (!reviewById.author.equals(req.user._id)) {
        req.flash('flashMsgError', 'You must be the author of this item to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}