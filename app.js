if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user'); 
const userRoutes = require('./routes/users')
const mongoSanitize = require('express-mongo-sanitize'); //to prevent mongo injections
const sessionStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const connectDB = async () => {
    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};
connectDB()
.then(() => console.log("Connected to Database"))
.catch((e) => new ExpressError(e));

const app = express();

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(morgan("dev"));
app.use(mongoSanitize()); //to sanitize the database and queries by removing anything starting with $ and . sign
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'bigsecret';

const store = new sessionStore({
    mongoUrl : dbUrl,
    secret,
    touchAfter : 24*3600,
})

store.on('error',function (e){
    console.log("Session Storage Error",e);
})

app.use(session({
    store,
    name: '_ycamp_user_', //name of session
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        // secure: true, for https connections ... will be used during deploying
        expires: Date.now()+(1000*60*60*24*7),
        maxAge : (1000*60*60*24*7)
    }
}))
app.use(flash());
//Authorization

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//authenticate method created by plugin on model

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success=req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//Using express-router to simplify code

app.use('/',userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server Connected to port ${port}`);
});

//Async functions should be wrapped in try-catch block to catch any error
//the error is passed to error handling middleware using next(e)
//next() is used to transfer control to next middleware
//and next(e) is used to transfer control to next error handling middleware


//Creating a 404 response middleware
//We do not call next here as there is nothing to run on a 404 page

// app.use((req, res) => {
//   res.send("OOPS, YOU HIT A 404 PAGE!!");
// });

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

//Creating custom error handler
//We do not call next here as there is error which needs to be resolved by the error like filling something correct in a form

app.use((err, req, res, next) => {
   // console.log(err);
    const {statusCode = 500} = err;
    if (!err.message) err.message = "Oh no! Something went wrong";
    res.status(statusCode).render("error", {err});
});
