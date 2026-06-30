const passport = require('passport');
const ApiError = require('../utils/ApiError');

const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) throw ApiError.unauthorized('Access token required');
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = auth;
