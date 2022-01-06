const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campgrounds");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 400; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const amt = Math.floor(Math.random() * 30) + 10;
    const camp = new Campground({
      author: "61cd87195ad0e12d84fe370a",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, facere recusandae voluptatem autem ex rem natus esse minus rerum assumenda cumque, quae tempora ipsam reiciendis labore non voluptate, consequatur vitae!
      Assumenda veniam harum ipsam dolores nesciunt similique, facilis illum unde molestias at hic fuga magnam placeat ut repellendus quam itaque deserunt sapiente corrupti. Totam ullam voluptatibus deleniti magnam harum a!`,
      price: amt,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dhoayd4fv/image/upload/v1640785745/YelpCamp/sku5t9ceizxf5wxmf5uu.jpg",
          filename: "YelpCamp/sku5t9ceizxf5wxmf5uu",
        },
        {
          url: "https://res.cloudinary.com/dhoayd4fv/image/upload/v1640785745/YelpCamp/xr5aipvc1ef4h5gwdlwa.jpg",
          filename: "YelpCamp/xr5aipvc1ef4h5gwdlwa",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
  console.log("Database populated");
});
