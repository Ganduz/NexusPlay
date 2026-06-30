const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const env = require('./env');

passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.jwt.secret,
}, (payload, done) => {
  return done(null, payload);
}));

passport.use('jwt-refresh', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
  secretOrKey: env.jwt.refreshSecret,
}, (payload, done) => {
  return done(null, payload);
}));

module.exports = passport;
