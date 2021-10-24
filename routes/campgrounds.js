//#region ****** I N C L U D E S *******
const express = require('express');
const router = express.Router(); // not sure what's this... TODO: check in express docs
const ctrllrCampgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn , isAuthor , joiValidateInput} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary'); // no need to requires "index" cause node automaticall looks for an "index.js" file in a folder
const upload = multer({ storage });
//#endregion


/**
 * We use router.routes whenever possible to chain 
 * same paths with different verbs!!
 * the cluster's order matters! remember.
*/

router.route('/')
    .get(catchAsync(ctrllrCampgrounds.index))
    .post(isLoggedIn, upload.array('image'), joiValidateInput, catchAsync(ctrllrCampgrounds.createCampground)); // quick hack for now.. but remember to validate the images with joi. and not bypass them, like now..
    //.post(upload.array('image'), (req, res) => {
    //    console.log(req.body, req.files);
    //    res.send("Did it work!?");
    //});
    // remember to set middleware (especially for POST reqs) to tell express to parse the body

router.get('/new', isLoggedIn, ctrllrCampgrounds.newCampgroundForm);

router.route('/:id')
    .get(catchAsync(ctrllrCampgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), joiValidateInput, catchAsync(ctrllrCampgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(ctrllrCampgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(ctrllrCampgrounds.editCampgroundForm));



module.exports = router;