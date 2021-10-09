const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: true,         // remember this does not serve as a full validation
        unique: true            // remember this does not serve as a full validation
    }
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);

/**
 * You're free to define your User how you like 
 * Passport-Local Mongoose will add a username, hash and a salt field 
 * to store the username, the hashed password and the salt value. 
 * Additionally, Passport-Local Mongoose adds some methods to your Schema. 
 * See the API Documentation section for more details
 */



