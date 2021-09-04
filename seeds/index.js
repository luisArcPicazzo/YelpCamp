
//#region  INCLUDES

/** This file will run on its own; separate to the main app. and it is only 
 * to seed our app's database with data to work with as develpment.
 */
const mongoose = require('mongoose');
const  Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Mongoose connected');
    })
    .catch(()=>{
        console.log('DB connection E R R O R');
        console.log(err);
    });

//#endregion

// Arrow function; gets an array parameter and randomizes its return index. to get a random place or descriptor
const getSampleTitle = array => array[Math.floor(Math.random() * array.length)]; // weird syntax but cool to study

// Randomizes and sets location, cities and title for Campground schema. then saves to local Mongo DB
const seedDB = async() => {
    await Campground.deleteMany({}); // {} => everything (mongo syntax)

    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground ({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${getSampleTitle(descriptors)} ${getSampleTitle(places)}` // weird syntax but cool one to master
        });
        await camp.save();
    }

}

// closes seeds' index.js nodemon console.
seedDB().then( () => {  // returns a promise because is an async function.
   mongoose.connection.close();
});