//#region  D E F A U L T   S E T T I N G S --- I N C L U D E S

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // to send other than POST and GET http verbs
const Campground = require('./models/campground');
const Review = require('./models/review');
const ejsMate = require('ejs-mate'); // one of many engines used to make sense of ejs... to add boilerplates..
const catchAsync = require('./utils/CatchAsync');
const { joiCampgroundSchema, joiReviewSchema} = require('./joiValidationSchemas');
const expressError = require('./utils/ExpressError');
const app = express();

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, useUnifiedTopology: true // does not support useCreateIndex: true anymore...
})
    .then(()=> {
        console.log("Mongoose Connected")
    })
    .catch(err => {
        console.log("Mongoose connection ERROR");
        console.log(err);
    });

/**
 * By default when we create a express app and we are also using some view engine express will assume, that our views (our templates) 
 * exist in a directory called 'views' we can change the path to be something else. but the default is /views, based upon the pwd.
*/
app.set('view engine', 'ejs'); // express behind the scenes requires ejs... so there's no need to do const <var> = require('ejs')


/** THIS IS GOOD PRACTICE 
 * In order to run the app from multiple directories different from pwd... the views folder needs to be changed with the following...
 * we require 'path from express'
 * then app.set('views', path.join(__dirname, '/views'));
*/
const path = require('path');
const campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const CatchAsync = require('./utils/CatchAsync');
const review = require('./models/review');

app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({ extended: true })); // middleware -> allow to parse http POST requests
app.use(methodOverride('_method')); // _method has to be passed to the .ejs file where you'll write the query string; E.g: ?_method=PUT

app.engine('ejs', ejsMate);

//#endregion


/**
 * Remember to follow REST (Representational State Transfer) 
 * for CRUD (Create, Read, Update, Delete) 
 * Consistent URL pattern matched with different HTTP verbs to expose full CRUD ops...
 * 
 * RESTfull PATTERN in conjunction with HTTP Verbs: 
 * GET /<nameOfEndpoint>    -> get info on that "end-point"
 * POST /<nameOfEndpoint>   -> on that "end-point"
 * PATCH /<nameOfEndpoint>  -> updating something about that "end-point"
 * PUT /<nameOfEndpoint>    -> replace somethinga about that "end-point"
 * DELETE /<nameOfEndpoint> -> delete something about that "end-Point"
 * 
 * _______________________________________________________________________________________
 * |  N A M E  |        P A T H       |  V E R B  |             P U R P O S E            |
 * | ----------|----------------------|-----------|--------------------------------------|
 * |  Index    |  /comments           |    GET    |  Display all comments                |
 * |  New      |  /comments/new       |    GET    |  Form to create new comment          |
 * |  Create   |  /comments           |    POST   |  Creates new comment on server       |
 * |  Show     |  /comments/:id       |    GET    |  Details for one specific comment    |
 * |  Edit     |  /comments/:id/edit  |    GET    |  Form to edit specific comment       |
 * |  Update   |  /comments/:id       |   PATCH   |  Updates specific comment on server  |
 * |  Destroy  |  /comments/:id       |  DELETE   |  Deletes specific item on server     |
 * ---------------------------------------------------------------------------------------
 * 
*/

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
        throw new ExpressError(joiValidationError, 400);
    } else {
        next();
    }
}

const joiValidateReview = (req, res, next) => {
    const { error } = joiReviewSchema.validate(req.body);
    if(error) {
        const joiValidationError = error.details.map(el => el.message).join(',');
        throw new ExpressError(joiValidationError, 400);
    } else {
        next();
    }
} 



app.get('/', (req, res) => {
    res.render('home'); // .render to respond with files. instead of strings. IT RENDERS A VIEW.
});

//app.get('/newcampground', async (req, res)=> {
//    const camp = new Campground({
//                    title: 'my backyard',
//                    description: 'cheap camping' });
//    await camp.save();
//    res.send(camp); // displays the database info...
//})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render ('campgrounds/index', { allCampgrounds });
}));

app.get('/campgrounds/new', async (req, res) =>{
    res.render('campgrounds/new');
});

// remember to set middleware (especially for POST reqs) to tell express to parse the body
app.post('/campgrounds', joiValidateInput, catchAsync(async (req, res, next) => { // catchAsync --> is the wrapper function created with CatchAsync.js which aids by catching errors without the need for try/catch blocks.
    const newlyCreatedCampground = new Campground(req.body.newCampground); // creates new model containing what was entered by the user in the http form.
    await newlyCreatedCampground.save();
    res.redirect(`campgrounds/${newlyCreatedCampground._id}`); // redirects you to the new campground by passing the newCamp's id to the url
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campGrndById = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campGrndById });
}));

app.get('/campgrounds/:id/edit', catchAsync(async(req, res) => {
    const campGrndById = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campGrndById });
}));

app.put('/campgrounds/:id', joiValidateInput, catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedData = await Campground.findByIdAndUpdate(id, { ...req.body.newCampground }); // spread title and location into id object??? check spread operator
    res.redirect(`/campgrounds/${updatedData._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const deleteData = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', joiValidateReview, CatchAsync(async(req, res)=> {
    const campGrndById = await Campground.findById(req.params.id);
    const campgrndReview = new Review(req.body.newCampgroundReview);
    campGrndById.reviews.push(campgrndReview);
    await campgrndReview.save();
    await campGrndById.save();
    res.redirect(`/campgrounds/${campGrndById._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res)=> { // delete the one object ID that corresponds to review
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
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } } );
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

app.all('*', (req, res, next)=> {
    next(new ExpressError('Page Not Found :(', 404));
    /**
     * all -> for every single request.. * -> for every single path 
     * Uses the ExpressError class defined in utils/ExpressError.js
     * Then passes through app.use (below) via next()
     */
});

app.use((err, req, res, next) => {

    const { statusCode = 500 } = err; // destructure..
    if(!err.message) err.message = 'Oh no! Something Went Wrong...';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('serving from port 3000');
});