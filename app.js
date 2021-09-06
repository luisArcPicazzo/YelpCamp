//#region  D E F A U L T   S E T T I N G S

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // to send other than POST and GET http verbs
const app = express();
const Campground = require('./models/campground');

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
app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({ extended: true })); // middleware -> allow to parse http POST requests
app.use(methodOverride('_method')); // _method has to be passed to the .ejs file where you'll write the query string; E.g: ?_method=PUT

//#endregion


/**
 * Remember to follow REST (Representational State Transfer) 
 * for CRUD (Create, Read, Update, Delete) 
 * Consistent URL pattern matched with different HTTP verbs to expose full CRUD ops...
 
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

app.get('/', (req, res) => {
    res.render('home'); // .render to respond with files. instead of strings. IT RENDERS A VIEW.
});

app.get('/newcampground', async (req, res)=> {
    const camp = new Campground({
                    title: 'my backyard',
                    description: 'cheap camping' });
    await camp.save();
    res.send(camp); // displays the database info...
})

app.get('/campgrounds', async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render ('campgrounds/index', { allCampgrounds });
});

app.get('/campgrounds/new', async (req, res) =>{
    res.render('campgrounds/new');
});

// remember to set middleware (especially for POST reqs) to tell express to parse the body
app.post('/campgrounds', async (req, res) => {
    const newlyCreatedCampground = new Campground(req.body.newCampground); // creates new model containing what was entered by the user in the http form.
    await newlyCreatedCampground.save();
    res.redirect(`campgrounds/${newlyCreatedCampground._id}`); // redirects you to the new campground by passing the newCamp's id to the url
});

app.get('/campgrounds/:id', async (req, res) => {
    const campGrndById = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campGrndById });
});

app.get('/campgrounds/:id/edit', async(req, res) => {
    const campGrndById = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campGrndById });
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = await Campground.findByIdAndUpdate(id, { ...req.body.newCampground }); // spread title and location into id object??? check spread operator
    res.redirect(`/campgrounds/${updatedData._id}`);
});

app.listen(3000, () => {
    console.log('serving from port 3000');
});