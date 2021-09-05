//#region  D E F A U L T   S E T T I N G S

const express = require('express');
const mongoose = require('mongoose');
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

//#endregion

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

app.get('/campgrounds/:id', async (req, res) => {
    const campGrndById = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campGrndById });
});

app.listen(3000, () => {
    console.log('serving from port 3000');
});