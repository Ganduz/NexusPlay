const pool = require('../config/db');

const userModel = {
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, username, avatar_url, role, provider, bio, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  },

  async create({ email, username, password_hash, provider = 'local', provider_id = null, avatar_url = null }) {
    const [result] = await pool.execute(
      `INSERT INTO users (email, username, password_hash, provider, provider_id, avatar_url, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, username, password_hash, provider, provider_id, avatar_url, FALSE]
    );
    return this.findById(result.insertId);
  },

  async updateProfile(id, { username, bio }) {
    const fields = [];
    const params = [];

    if (username !== undefined) { fields.push('username = ?'); params.push(username); }
    if (bio !== undefined) { fields.push('bio = ?'); params.push(bio); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return this.findById(id);
  },

  async updateAvatar(id, avatarUrl) {
    await pool.execute(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, id]
    );
    return this.findById(id);
  },

  async getDashboardStats(userId) {
    const [orderCount] = await pool.execute(
      'SELECT COUNT(*) as count, SUM(total) as total_spent FROM orders WHERE user_id = ? AND status = "completed"',
      [userId]
    );
    const [wishlistCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?',
      [userId]
    );
    const [reviewCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      [userId]
    );
    const [libraryCount] = await pool.execute(
      'SELECT COUNT(DISTINCT oi.game_platform_id) as count FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.user_id = ? AND o.status = "completed"',
      [userId]
    );

    return {
      orders: orderCount[0].count,
      total_spent: parseFloat(orderCount[0].total_spent) || 0,
      wishlist: wishlistCount[0].count,
      reviews: reviewCount[0].count,
      library: libraryCount[0].count,
    };
  },
};

module.exports = userModel;
