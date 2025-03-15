// Middleware to check if user is authenticated using method given by Passport.js
module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
