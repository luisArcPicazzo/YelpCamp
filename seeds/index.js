
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
        const randomPrice = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground ({
            author: '61626e8e684b7128963061aa',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${getSampleTitle(descriptors)} ${getSampleTitle(places)}`, // weird syntax but cool one to master
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed fugit qui reiciendis iusto blanditiis? Id officiis, neque at sed eveniet,\
            repellat quasi tempora laboriosam odit ipsam omnis fugit sequi quaerat Vitae reprehenderit nam beatae quis officiis natus nemo aliquam, deserunt placeat \
            est facere blanditiis consectetur dicta unde possimus eaque, aut consequuntur eos similique? Aspernatur recusandae sint atque vero harum dolor Sequi ullam \
            necessitatibus maxime voluptatibus. Labore commodi porro repellendus quos ipsum voluptate deserunt saepe expedita impedit dolore praesentium itaque dicta \
            provident nisi inventore magnam ea, excepturi cupiditate. Provident, delectus iste!',
            price: randomPrice
        });
        await camp.save();
    }

}

// closes seeds' index.js nodemon console.
seedDB().then( () => {  // returns a promise because is an async function.
   mongoose.connection.close();
});