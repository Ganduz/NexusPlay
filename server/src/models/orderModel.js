const pool = require('../config/db');

const orderModel = {
  async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;

    const [orders] = await pool.execute(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get items for each order
    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, gp.game_id, g.slug as game_slug, g.rawg_id
         FROM order_items oi
         JOIN game_platforms gp ON oi.game_platform_id = gp.id
         JOIN games g ON gp.game_id = g.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findById(orderId, userId) {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (orders.length === 0) return null;

    const order = orders[0];
    const [items] = await pool.execute(
      `SELECT oi.*, gp.game_id, g.slug as game_slug, g.rawg_id
       FROM order_items oi
       JOIN game_platforms gp ON oi.game_platform_id = gp.id
       JOIN games g ON gp.game_id = g.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    order.items = items;
    return order;
  },

  async getUserLibrary(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [countResult] = await pool.execute(
      `SELECT COUNT(DISTINCT oi.game_platform_id) as total
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND o.status = 'completed'`,
      [userId]
    );
    const total = countResult[0].total;

    const [items] = await pool.execute(
      `SELECT oi.game_name, oi.platform_name, oi.edition_name, oi.serial_key,
              oi.final_price, oi.created_at as purchased_at,
              g.slug as game_slug, g.rawg_id,
              p.slug as platform_slug,
              o.order_number
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN game_platforms gp ON oi.game_platform_id = gp.id
       JOIN games g ON gp.game_id = g.id
       JOIN platforms p ON gp.platform_id = p.id
       WHERE o.user_id = ? AND o.status = 'completed'
       ORDER BY oi.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
};

module.exports = orderModel;
