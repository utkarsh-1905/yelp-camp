const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");
const review = require("../controllers/reviews");

//It is showing error "Cannot read properties of null" when posting a comment because
//router does not have access to params passed by the app in main app.js file
//router maintains it's own params
//to access the original params we pass a option to router {mergeParams:true}

router.post("/", isLoggedIn, validateReview, review.createReview);

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, review.deleteReview);

module.exports = router;
