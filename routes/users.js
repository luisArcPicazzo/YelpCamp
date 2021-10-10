const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/CatchAsync');
const User = require('../models/user');


router.get('/register', (req, res) => {
    res.render('users/register');
});

 router.post('/register', catchAsync(async (req, res) =>{
    try{
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const newRegisteredUser = await User.register(newUser, password);
        //console.log(newRegisteredUser);
        req.flash('flashMsgSuccess', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
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
    res.redirect('/campgrounds');
});

module.exports = router;