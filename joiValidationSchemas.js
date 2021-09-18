//const Joi = require('joi');
const joi = require ('joi');

//module.exports.joiCampgroundSchema = 
//Joi.object({
//    newCampground: 
//        Joi.object({
//            title: Joi.string().required(),
//            image: Joi.string().required(),
//            price: Joi.number().required().min(0.0),
//            description: Joi.string().required(),
//            location: Joi.string().required()
//        }).required() // newCampground comes from new.ejs 
//})


module.exports.joiCampgroundSchema = 
joi.object({
    newCampground: 
        joi.object({
            title: joi.string().required(),
            image: joi.string().required(),
            price: joi.number().required().min(0.0),
            description: joi.string().required(),
            location: joi.string().required()
        }).required() // newCampground comes from new.ejs 
})