const pool = require('../config/db');

const cartModel = {
  async getCartByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT ci.id, ci.quantity, ci.added_at,
              gp.id as game_platform_id, gp.base_price, gp.discount_percent, gp.final_price,
              gp.stock_status, gp.delivery_type,
              g.id as game_id, g.name as game_name, g.slug as game_slug, g.rawg_id,
              p.name as platform_name, p.slug as platform_slug, p.icon as platform_icon,
              ge.name as edition_name, ge.slug as edition_slug
       FROM cart_items ci
       JOIN game_platforms gp ON ci.game_platform_id = gp.id
       JOIN games g ON gp.game_id = g.id
       JOIN platforms p ON gp.platform_id = p.id
       JOIN game_editions ge ON gp.edition_id = ge.id
       WHERE ci.user_id = ?
       ORDER BY ci.added_at DESC`,
      [userId]
    );
    return rows;
  },

  async addItem(userId, gamePlatformId, quantity = 1) {
    const [existing] = await pool.execute(
      'SELECT quantity FROM cart_items WHERE user_id = ? AND game_platform_id = ?',
      [userId, gamePlatformId]
    );
    const currentQty = existing.length > 0 ? existing[0].quantity : 0;
    if (currentQty + quantity > 5) {
      throw new Error('Maximum 5 copies per product');
    }
    await pool.execute(
      `INSERT INTO cart_items (user_id, game_platform_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, gamePlatformId, quantity]
    );
    return this.getCartByUserId(userId);
  },

  async removeItem(userId, itemId) {
    await pool.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );
    return this.getCartByUserId(userId);
  },

  async clearCart(userId) {
    await pool.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );
  },

  async mergeCart(userId, items) {
    for (const item of items) {
      const [existing] = await pool.execute(
        'SELECT quantity FROM cart_items WHERE user_id = ? AND game_platform_id = ?',
        [userId, item.game_platform_id]
      );
      const currentQty = existing.length > 0 ? existing[0].quantity : 0;
      if (currentQty + (item.quantity || 1) > 5) {
        throw new Error('Maximum 5 copies per product');
      }
      await pool.execute(
        `INSERT INTO cart_items (user_id, game_platform_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
        [userId, item.game_platform_id, item.quantity || 1]
      );
    }
    return this.getCartByUserId(userId);
  },

  async getCartSummary(userId) {
    const [rows] = await pool.execute(
      `SELECT
        COUNT(*) as item_count,
        SUM(gp.base_price * ci.quantity) as subtotal,
        SUM((gp.base_price - gp.final_price) * ci.quantity) as discount,
        SUM(gp.final_price * ci.quantity) as total
       FROM cart_items ci
       JOIN game_platforms gp ON ci.game_platform_id = gp.id
       WHERE ci.user_id = ?`,
      [userId]
    );
    return {
      item_count: rows[0].item_count,
      subtotal: parseFloat(rows[0].subtotal) || 0,
      discount: parseFloat(rows[0].discount) || 0,
      total: parseFloat(rows[0].total) || 0,
    };
  },
};

module.exports = cartModel;
