const Campground = require("../models/campgrounds");
const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");

module.exports.createReview = catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.review.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Successfully added a review");
  res.redirect(`/campgrounds/${campground._id}`);
});

module.exports.deleteReview = catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted");
  res.redirect(`/campgrounds/${id}`);
});
