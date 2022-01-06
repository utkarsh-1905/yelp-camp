const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200,h_200");
});

const CampgroundSchema = new Schema(
  {
    title: String,
    price: Number,
    images: [ImageSchema],
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    review: [
      //referencing the Review model to link all comments of a particular campground
      // Represents one-many relationship
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
  }
);

CampgroundSchema.virtual("properties.popUp").get(function () {
  return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>
  `;
});

//Mongoose Middleware
//post middleware because it will return the deleted object which can be used to find the
//review id and delete the corresponding reviews

CampgroundSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

//Exporting the Campground model class to be able to create its new instances

module.exports = mongoose.model("Campground", CampgroundSchema);
