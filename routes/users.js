const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/CatchAsync');
const User = require('../models/user');


router.get('/register', (req, res) => {
    res.render('users/register');
});

 router.post('/register', catchAsync(async (req, res, next) =>{
    try{
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const newRegisteredUser = await User.register(newUser, password); // saves into database and hashes the psw
        req.login(newRegisteredUser, err => { // used to immediately log in a newly registered user. Involves callback 
            if(err) return next(err);         // no async-await option for this helper method. 
            req.flash('flashMsgSuccess', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch(e) {
        req.flash('flashMsgError', e.message);
        res.redirect('register');
    }
 }));

router.get('/login', (req, res) => {
    res.render('users/login');
});

/**
 * Passport provides the "passport.authenticate(<strategy>, [<flashMsgs, etc...>])" 
 * middleware which does magic for authentication purposes.
 */
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'} ), (req, res) => {
    req.flash('flashMsgSuccess', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'; // either the default 'homepage' or the originally intended requested URL
    delete req.session.returnTo; // then delete whatever the variable has.
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout(); // another helper function courtesy of passport that does magic
    req.flash('flashMsgSuccess', 'Goodbye!');
    res.redirect('/campgrounds');
});

module.exports = router;