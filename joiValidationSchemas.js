const baseJoi = require ('joi');
const sanitizeHTML = require('sanitize-html');

/* You can 'extend' Joi's functionality in order to addres different scenarios; In this case we'll
 * our own validation code in order to deem wheder html is safe (to avoid xss cross-side scripting) 
 */
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: 
    {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: 
    {
        escapeHTML: 
        {
            validate(value, helpers) 
            {
                const clean = sanitizeHTML( value, 
                                                    { 
                                                        allowedTags: [], // allow none
                                                        allowedAttributes: {}, // allow none
                                                    });
                 if(clean !== value) return helpers.error('string.escapeHTML', { value });
                 return clean;
            }
        }
    }
});

const joi = baseJoi.extend(extension);

module.exports.joiCampgroundSchema = 
joi.object({
    newCampground: 
        joi.object({
            title: joi.string().required().escapeHTML(),
            // image: joi.string().required(),  // disabled due to cloudinary tests..

            price: joi.number().required().min(0.0),
            description: joi.string().required().escapeHTML(),
            location: joi.string().required().escapeHTML()
        }).required(), // newCampground comes from new.ejs
        deleteImages: joi.array()
});

module.exports.joiReviewSchema = 
joi.object({
    newCampgroundReview:
        joi.object({
            rating: joi.number().required().min(0).max(5),
            body: joi.string().required().escapeHTML()
        }).required() //  newCampgroundReview comes from show.ejs
});




// images: joi.array().items(
//     joi.object({
//           url: joi.string().required(),
//           filename: joi.string().required()
//     }).required()
// ).required(),