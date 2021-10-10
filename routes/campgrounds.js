const express = require('express');
const router = express.Router(); // not sure what's this... TODO: check in express docs
const catchAsync = require('../utils/CatchAsync');
const expressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { joiCampgroundSchema } = require('../joiValidationSchemas');
const { isLoggedIn } = require('../middleware');

// Temporary middleware section:

const joiValidateInput = (req, res, next) => {
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

const isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campgroundById = await Campground.findById(id);
    if (!campgroundById.author.equals(req.user._id)) {
        req.flash('flashMsgError', 'You must be the author of this item to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//router.get('/', (req, res) => {
//    res.render('home'); // .render to respond with files. instead of strings. IT RENDERS A VIEW.
//});

router.get('/', catchAsync(async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render ('campgrounds/index', { allCampgrounds });
}));

router.get('/new', isLoggedIn, (req, res) =>{
    res.render('campgrounds/new');
});

// remember to set middleware (especially for POST reqs) to tell express to parse the body
router.post('/', isLoggedIn, joiValidateInput, catchAsync(async (req, res, next) => { // catchAsync --> is the wrapper function created with CatchAsync.js which aids by catching errors without the need for try/catch blocks.
    const newlyCreatedCampground = new Campground(req.body.newCampground); // creates new model containing what was entered by the user in the http form.
    newlyCreatedCampground.author = req.user._id; // associate the logged in user as author to the newly created campground
    await newlyCreatedCampground.save();
    req.flash('flashMsgSuccess', 'New campground created!'); // make sure you display this info in the template (ejs)
    res.redirect(`campgrounds/${newlyCreatedCampground._id}`); // redirects you to the new campground by passing the newCamp's id to the url
}));

router.get('/:id', catchAsync(async (req, res) => {
    const campGrndById = await Campground.findById(req.params.id).populate('reviews').populate('author');
    console.log(campGrndById);
    if(!campGrndById) { // if campground not found (got deleted of something...)
        req.flash('flashMsgError', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campGrndById });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const campGrndById = await Campground.findById(req.params.id);
    if(!campGrndById) {
        req.flash('flashMsgError', 'Could not find that Campground :(');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campGrndById });
}));

router.put('/:id', isLoggedIn, isAuthor, joiValidateInput, catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedData = await Campground.findByIdAndUpdate(id, { ...req.body.newCampground }); // spread title and location into id object??? check spread operator
    req.flash('flashMsgSuccess', 'Campground successfully updated!'); // make sure you display this info in the template (ejs)
    res.redirect(`/campgrounds/${updatedData._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const deleteData = await Campground.findByIdAndDelete(id);
    req.flash('flashMsgSuccess', 'Campground successfully deleted!'); // make sure you display this info in the template (ejs)
    res.redirect('/campgrounds');
}));

module.exports = router;