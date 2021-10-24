const Campground = require('../models/campground');


module.exports.index = async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render ('campgrounds/index', { allCampgrounds });
}

module.exports.newCampgroundForm = (req, res) =>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => { // catchAsync --> is the wrapper function created with CatchAsync.js which aids by catching errors without the need for try/catch blocks.
    const newlyCreatedCampground = new Campground(req.body.newCampground); // creates new model containing what was entered by the user in the http form.
    // map over request.files (it's an array which contains the cloudinary stuff).
    // so.. within req.files; assign cloudinary's path (f.path) & filename (f.filename) to url & filename within the (campground model) respectively.
    newlyCreatedCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); // implicit return requires parens around the braces...
    newlyCreatedCampground.author = req.user._id; // associate the logged in user as author to the newly created campground
    await newlyCreatedCampground.save();
    console.log(newlyCreatedCampground);
    req.flash('flashMsgSuccess', 'New campground created!'); // make sure you display this info in the template (ejs)
    res.redirect(`campgrounds/${newlyCreatedCampground._id}`); // redirects you to the new campground by passing the newCamp's id to the url
}

module.exports.showCampground = async (req, res) => {
    const campGrndById = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: { // nested 'populate' in order identify each review comment with each owner
            path: 'author'
        }
    }).populate('author'); // this populate displays the author of the campground
    console.log(campGrndById);
    if(!campGrndById) { // if campground not found (got deleted of something...)
        req.flash('flashMsgError', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campGrndById });
}

module.exports.editCampgroundForm = async(req, res) => {
    const campGrndById = await Campground.findById(req.params.id);
    if(!campGrndById) {
        req.flash('flashMsgError', 'Could not find that Campground :(');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campGrndById });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const updatedData = await Campground.findByIdAndUpdate(id, { ...req.body.newCampground }); // spread title and location into id object??? check spread operator
    // map over request.files (it's an array which contains the cloudinary stuff).
    // so.. within req.files; assign cloudinary's path (f.path) & filename (f.filename) to url & filename within the (campground model) respectively.
    const updatedImages = req.files.map(f => ({ url: f.path, filename: f.filename })); // implicit return requires parens around the braces...
    updatedData.images.push(...updatedImages);
    await updatedData.save();
    req.flash('flashMsgSuccess', 'Campground successfully updated!'); // make sure you display this info in the template (ejs)
    res.redirect(`/campgrounds/${updatedData._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deleteData = await Campground.findByIdAndDelete(id);
    req.flash('flashMsgSuccess', 'Campground successfully deleted!'); // make sure you display this info in the template (ejs)
    res.redirect('/campgrounds');
}