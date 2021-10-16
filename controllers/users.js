const User = require('../models/user');



module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) =>{
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
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('flashMsgSuccess', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'; // either the default 'homepage' or the originally intended requested URL
    delete req.session.returnTo; // then delete whatever the variable has.
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(); // another helper function courtesy of passport that does magic
    req.flash('flashMsgSuccess', 'Goodbye!');
    res.redirect('/campgrounds');
}