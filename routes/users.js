
 //#region ****** I N C L U D E S *******
const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/CatchAsync');
const ctrllrUsers = require('../controllers/users');
//#endregion


router.route('/register')
    .get(ctrllrUsers.renderRegisterForm)
    .post(catchAsync(ctrllrUsers.register));

router.route('/login')
    .get(ctrllrUsers.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'} ), ctrllrUsers.login);
    /**
     * Passport provides the "passport.authenticate(<strategy>, [<flashMsgs, etc...>])" 
     * middleware which does magic for authentication purposes.
    */

router.get('/logout', ctrllrUsers.logout);



module.exports = router;