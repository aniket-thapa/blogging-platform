// Middleware to check if user is authenticated
module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // Save the requested URL in the session
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};
