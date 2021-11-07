//#region  D E F A U L T   S E T T I N G S --- I N C L U D E S
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // to send other than POST and GET http verbs
const ejsMate = require('ejs-mate'); // one of many engines used to make sense of ejs... to add boilerplates..
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const passport = require('passport');
const passportLocalStrategy = require('passport-local'); // nothing to do with 'passport-local-mongoose', that belongs to the User model...
const User = require('./models/user');
const routesUsers = require('./routes/users');
const routesCampgrounds = require('./routes/campgrounds');
const routesReviews = require('./routes/reviews');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const mongoDBStore = require('connect-mongo')(session);
const productionDbUrl =  process.env.PRODUCTION_DB_URL;
const developmentDbUrl = 'mongodb://localhost:27017/yelp-camp';
const DBUrl = productionDbUrl || developmentDbUrl;
const secretProduction = process.env.SECRET;
const secretDevelopment = 'secret';
const secretSessionConfig =  secretProduction || secretDevelopment;
// mongoose.connect(productionDbUrl, {
//mongoose.connect(developmentDbUrl, {
mongoose.connect(DBUrl, {
    useNewUrlParser: true, useUnifiedTopology: true // does not support useCreateIndex: true anymore...
})
    .then(()=> {
        console.log("Mongoose Connected")
    })
    .catch(err => {
        console.log("Mongoose connection ERROR");
        console.log(err);
    });

/**
 * By default when we create a express app and we are also using some view engine express will assume, that our views (our templates) 
 * exist in a directory called 'views' we can change the path to be something else. but the default is /views, based upon the pwd.
*/
app.set('view engine', 'ejs'); // express behind the scenes requires ejs... so there's no need to do const <var> = require('ejs')


/** THIS IS GOOD PRACTICE 
 * In order to run the app from multiple directories different from pwd... the views folder needs to be changed with the following...
 * we require 'path from express'
 * then app.set('views', path.join(__dirname, '/views'));
*/
const path = require('path');
const expressError = require('./utils/ExpressError');
const { MongoStore } = require('connect-mongo');

app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // middleware -> allow to parse http POST requests
app.use(methodOverride('_method')); // _method has to be passed to the .ejs file where you'll write the query string; E.g: ?_method=PUT
app.use(express.static(path.join(__dirname, 'public'))); // serve our static assets whose scripts are located in the "public" directory.
/**
 * Sets up session (cookies and stuff)
 */
const DBStore = new mongoDBStore({
    url: DBUrl,
    secret: 'secret',
    touchAfter: 24 * 60 * 60 , // (converted to seconds hrs * mins * secs ) lazy updates session to avoid unnecessary session resave on database (don't continously update after a user refreshes a page every time. unless. touchAfter time has elapsed)
});

DBStore.on('error', function(e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store: DBStore,
    secret: secretSessionConfig,
    resave: false,
    saveUninitialized: true,
    /** The above two options are to remove deprecation warnings */
    cookie: {
        name: 'CUSTOMcookieSIDNAME', // good to customize name, in order to camouflage the coolkie's default id name.
        httpOnly: true, // protects cookie to not be accessed through client-side scripts, and as a result even w/cross side scripting, the browser will not reveal the cookie to the party.
        //secure: true, // means cookie will work through https only! that is; breaks things if in localhost. (set to true on deploy)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // ms * sec * mins * hrs * days (ms in a week so it expires in a week)
        maxAge: 1000 * 60 * 60 * 24 * 7
        /** 
         * If no expiration day set, once the user logs in, it will stay logged in forever. 
         * So no expiration date means less secure. That's why it is recommended to set 
         * an expiration date.
         */
    }
}
app.use(session(sessionConfig)); // After setting up session we can now use "connect-flash"
app.use(flash()); // Should be able to flash something by calling request.flash(key, value)
app.use(passport.initialize()); 
app.use(passport.session()); // Use if you need persistent log-in sessions. Make sure you use session (as in app.use(session(sessionConfig));) before passport.session()...
app.use(mongoSanitize());
//app.use(helmet({ contentSecurityPolicy: false })); // careful, cause calling this (with no arguments) automatically enables all 11 of helmet's middleware. That is; could break things... Pass the correct argument in order to disable a specific middleware
app.use(helmet()); // careful, cause calling this (with no arguments) automatically enables all 11 of helmet's middleware. That is; could break things... Pass the correct argument in order to disable a specific middleware

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["blob:"], // safari needs the blob there
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/e-pc/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

passport.use(new passportLocalStrategy(User.authenticate())); // method within passportLocalMongoose.
passport.serializeUser(User.serializeUser());      // how do we store a user in the session
passport.deserializeUser(User.deserializeUser());  // how do we get the user out of the session un-store them 

app.engine('ejs', ejsMate);

//#endregion


/**
 * Remember to follow REST (Representational State Transfer) 
 * for CRUD (Create, Read, Update, Delete) 
 * Consistent URL pattern matched with different HTTP verbs to expose full CRUD ops...
 * 
 * RESTfull PATTERN in conjunction with HTTP Verbs: 
 * GET /<nameOfEndpoint>    -> get info on that "end-point"
 * POST /<nameOfEndpoint>   -> on that "end-point"
 * PATCH /<nameOfEndpoint>  -> updating something about that "end-point"
 * PUT /<nameOfEndpoint>    -> replace somethinga about that "end-point"
 * DELETE /<nameOfEndpoint> -> delete something about that "end-Point"
 * 
 * _______________________________________________________________________________________
 * |  N A M E  |        P A T H       |  V E R B  |             P U R P O S E            |
 * | ----------|----------------------|-----------|--------------------------------------|
 * |  Index    |  /comments           |    GET    |  Display all comments                |
 * |  New      |  /comments/new       |    GET    |  Form to create new comment          |
 * |  Create   |  /comments           |    POST   |  Creates new comment on server       |
 * |  Show     |  /comments/:id       |    GET    |  Details for one specific comment    |
 * |  Edit     |  /comments/:id/edit  |    GET    |  Form to edit specific comment       |
 * |  Update   |  /comments/:id       |   PATCH   |  Updates specific comment on server  |
 * |  Destroy  |  /comments/:id       |  DELETE   |  Deletes specific item on server     |
 * ---------------------------------------------------------------------------------------
 * 
*/

// TEMPORARY MIDDLEWARE SECTION:
    // Flash Middleware
app.use((req, res, next) => {
//    console.log(req.query);
    res.locals.currentSignedInUser = req.user;
    res.locals.flashMsgSuccess = req.flash('flashMsgSuccess');
    res.locals.flashMsgError = req.flash('flashMsgError');
    res.locals.passportAuthError = req.flash('error');

    /** 
     * whatever res.locals.success contains, we'll have access 
     * to it automatically in our template so we don't have to pass 
     * it through... 
     * That is; on every single request () we take whatever's in the 
     * flash under 'success' and have access to it in our locals (res.locals) 
     * under the key success (.success)
    */

    next(); // don't forget to call next(); !!!
});


app.use('/', routesUsers);
app.use('/campgrounds', routesCampgrounds); // prefixed with "/campgrounds"
app.use('/campgrounds/:id/reviews', routesReviews);

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next)=> {
    next(new expressError('Page Not Found :(', 404));
    /**
     * all -> for every single request.. * -> for every single path 
     * Uses the ExpressError class defined in utils/ExpressError.js
     * Then passes through app.use (below) via next()
     */
});

app.use((err, req, res, next) => {

    const { statusCode = 500 } = err; // destructure..
    if(!err.message) err.message = 'Oh no! Something Went Wrong...';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('serving from port 3000');
});