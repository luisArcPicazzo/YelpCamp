const joi = require ('joi');

module.exports.joiCampgroundSchema = 
joi.object({
    newCampground: 
        joi.object({
            title: joi.string().required(),
            // image: joi.string().required(),  // disabled due to cloudinary tests..

            price: joi.number().required().min(0.0),
            description: joi.string().required(),
            location: joi.string().required()
        }).required() // newCampground comes from new.ejs 
});

module.exports.joiReviewSchema = 
joi.object({
    newCampgroundReview:
        joi.object({
            rating: joi.number().required().min(0).max(5),
            body: joi.string().required()
        }).required() //  newCampgroundReview comes from show.ejs
});




// images: joi.array().items(
//     joi.object({
//           url: joi.string().required(),
//           filename: joi.string().required()
//     }).required()
// ).required(),