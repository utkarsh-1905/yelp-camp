const Campground = require("../models/campgrounds");
const { cloudinary } = require("../cloudinary_config");
const mpx = require("@mapbox/mapbox-sdk/services/geocoding");
const mpxToken = process.env.MAPBOX_ACCESS_KEY;
const geocoder = mpx({accessToken : mpxToken});

module.exports.renderCampgrounds = async (req, res) => {
  const data = await Campground.find({});
  res.render("campgrounds/campgrounds", { data });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.showCampgrounds = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "review",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // populate() is used to populate the Campground model which has the reference for the Review model
  //with the review data
  if (!campground) {
    req.flash("danger", "Campground Not Found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.createNewCampground = async (req, res) => {
  const geoData =await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit:1,
  }).send();
  const data = req.body.campground;
  const campground = new Campground(data);
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.geometry = geoData.body.features[0].geometry;
  campground.author = req.user._id;
  await campground.save();
  // console.log(campground);
  req.flash("success", "Successfully made a new Campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("danger", "Campground Not Found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    { runValidators: true, new: true }
  );
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  //deleting photos
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      //deleting on cloud
      await cloudinary.uploader.destroy(filename);
    }
    //deleting on database
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    //query to find and delete in image url in database
  }
  req.flash("success", "Successfully updated campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
