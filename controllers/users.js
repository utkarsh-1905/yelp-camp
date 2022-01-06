const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register");
};

module.exports.registerUser = catchAsync(async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const regUser = await User.register(user, password);
    req.login(regUser, (err) => {
      if (err) return next(err);
      else {
        req.flash("success", "Welcome to YelpCamp");
        res.redirect("/");
      }
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

module.exports.renderLoginForm = (req, res) => res.render("users/login");

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!!");
  const redirectUrl = req.session.returnTo || "/";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

//logout method is added to req object which can called to simply logged out on hitting the route

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Successfully logged out!!");
  res.redirect("/");
};
