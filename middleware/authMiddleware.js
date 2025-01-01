// Middleware to save the original URL
function saveOriginalUrl(req, res, next) {
    if (!req.isAuthenticated() && req.method === 'GET') {
        req.session.returnTo = req.originalUrl; // Save the URL in session
    }
    next();
}
app.use(saveOriginalUrl);


// Middleware to check if user is authenticated
module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
