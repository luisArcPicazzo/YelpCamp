module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {// passport's helper function 
        req.flash('flashMsgError', 'You must sign in first!');
        return res.redirect('/login');
    }
    next();
};