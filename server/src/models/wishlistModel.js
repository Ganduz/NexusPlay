const pool = require('../config/db');

const wishlistModel = {
  async getByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT w.id, w.added_at,
              g.id as game_id, g.rawg_id, g.slug, g.name,
              MIN(gp.final_price) as min_price,
              MAX(gp.discount_percent) as max_discount
       FROM wishlist w
       JOIN games g ON w.game_id = g.id
       LEFT JOIN game_platforms gp ON g.id = gp.game_id AND gp.active = TRUE
       WHERE w.user_id = ?
       GROUP BY w.id, g.id
       ORDER BY w.added_at DESC`,
      [userId]
    );
    return rows;
  },

  async toggle(userId, gameId) {
    // Check if exists
    const [existing] = await pool.execute(
      'SELECT id FROM wishlist WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    if (existing.length > 0) {
      await pool.execute(
        'DELETE FROM wishlist WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      );
      return { added: false };
    }

    await pool.execute(
      'INSERT INTO wishlist (user_id, game_id) VALUES (?, ?)',
      [userId, gameId]
    );
    return { added: true };
  },

  async isInWishlist(userId, gameId) {
    const [rows] = await pool.execute(
      'SELECT id FROM wishlist WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );
    return rows.length > 0;
  },
};

module.exports = wishlistModel;
