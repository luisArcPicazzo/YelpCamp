const express = require('express');
const router = express.Router(); // not sure what's this... TODO: check in express docs
const catchAsync = require('../utils/CatchAsync');
const expressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { joiCampgroundSchema } = require('../joiValidationSchemas');

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

//router.get('/', (req, res) => {
//    res.render('home'); // .render to respond with files. instead of strings. IT RENDERS A VIEW.
//});

router.get('/', catchAsync(async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render ('campgrounds/index', { allCampgrounds });
}));

router.get('/new', async (req, res) =>{
    res.render('campgrounds/new');
});

// remember to set middleware (especially for POST reqs) to tell express to parse the body
router.post('/', joiValidateInput, catchAsync(async (req, res, next) => { // catchAsync --> is the wrapper function created with CatchAsync.js which aids by catching errors without the need for try/catch blocks.
    const newlyCreatedCampground = new Campground(req.body.newCampground); // creates new model containing what was entered by the user in the http form.
    await newlyCreatedCampground.save();
    res.redirect(`campgrounds/${newlyCreatedCampground._id}`); // redirects you to the new campground by passing the newCamp's id to the url
}));

router.get('/:id', catchAsync(async (req, res) => {
    const campGrndById = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campGrndById });
}));

router.get('/:id/edit', catchAsync(async(req, res) => {
    const campGrndById = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campGrndById });
}));

router.put('/:id', joiValidateInput, catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedData = await Campground.findByIdAndUpdate(id, { ...req.body.newCampground }); // spread title and location into id object??? check spread operator
    res.redirect(`/campgrounds/${updatedData._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const deleteData = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

module.exports = router;