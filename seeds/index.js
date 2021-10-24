
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
            author: '6175219bb14bcdc119cc4b9e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${getSampleTitle(descriptors)} ${getSampleTitle(places)}`, // weird syntax but cool one to master
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed fugit qui reiciendis iusto blanditiis? Id officiis, neque at sed eveniet,\
            repellat quasi tempora laboriosam odit ipsam omnis fugit sequi quaerat Vitae reprehenderit nam beatae quis officiis natus nemo aliquam, deserunt placeat \
            est facere blanditiis consectetur dicta unde possimus eaque, aut consequuntur eos similique? Aspernatur recusandae sint atque vero harum dolor Sequi ullam \
            necessitatibus maxime voluptatibus. Labore commodi porro repellendus quos ipsum voluptate deserunt saepe expedita impedit dolore praesentium itaque dicta \
            provident nisi inventore magnam ea, excepturi cupiditate. Provident, delectus iste!',
            price: randomPrice,
            images: [
                {
                  url: 'https://res.cloudinary.com/e-pc/image/upload/v1635096294/YelpCamp/l0tf2dcnjgw4shjib4wj.jpg',
                  filename: 'YelpCamp/l0tf2dcnjgw4shjib4wj'
                },
                {
                  url: 'https://res.cloudinary.com/e-pc/image/upload/v1635096296/YelpCamp/j2gyevb1c9suu26xrc8k.jpg',
                  filename: 'YelpCamp/j2gyevb1c9suu26xrc8k'
                },
                {
                  url: 'https://res.cloudinary.com/e-pc/image/upload/v1635096297/YelpCamp/qjuqyfjoo86miz2k4hvt.jpg',
                  filename: 'YelpCamp/qjuqyfjoo86miz2k4hvt'
                }
              ]
        });
        await camp.save();
    }

}

// closes seeds' index.js nodemon console.
seedDB().then( () => {  // returns a promise because is an async function.
   mongoose.connection.close();
});