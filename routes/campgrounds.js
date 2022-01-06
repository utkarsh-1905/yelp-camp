const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isAuthor, validateCampgrounds } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer"); //It is an middleware to parse file input in a form
const { storage } = require("../cloudinary_config");
const upload = multer({ storage });

const campgrounds = require("../controllers/campground");

router.get("/", catchAsync(campgrounds.renderCampgrounds));

router.get("/new", isLoggedIn, catchAsync(campgrounds.renderNewForm));

router.get("/:id", catchAsync(campgrounds.showCampgrounds));

router.post(
  "/",
  isLoggedIn,
  upload.array("campground[image]"), //first data needs to be threre for validation // array() to upload multiple images
  validateCampgrounds,
  catchAsync(campgrounds.createNewCampground)
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  upload.array('campground[image]'),
  validateCampgrounds,
  catchAsync(campgrounds.updateCampground)
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
