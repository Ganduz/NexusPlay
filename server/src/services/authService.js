const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

const authService = {
  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );
  },

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      env.jwt.refreshSecret,
      { expiresIn: env.jwt.refreshExpiresIn }
    );
  },

  generateTokenPair(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  },
};

module.exports = authService;
