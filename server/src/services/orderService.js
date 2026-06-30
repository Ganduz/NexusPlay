const pool = require('../config/db');
const generateOrderNumber = require('../utils/generateOrderNumber');
const generateSerialKey = require('../utils/generateSerialKey');

const orderService = {
  /**
   * Create order from cart items
   */
  async createOrder(userId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get cart items with full details
      const [cartItems] = await connection.execute(
        `SELECT ci.id, ci.game_platform_id, ci.quantity,
                gp.base_price, gp.discount_percent, gp.final_price, gp.stock_status,
                g.name as game_name, g.slug as game_slug,
                p.name as platform_name,
                ge.name as edition_name
         FROM cart_items ci
         JOIN game_platforms gp ON ci.game_platform_id = gp.id
         JOIN games g ON gp.game_id = g.id
         JOIN platforms p ON gp.platform_id = p.id
         JOIN game_editions ge ON gp.edition_id = ge.id
         WHERE ci.user_id = ?`,
        [userId]
      );

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Check stock
      for (const item of cartItems) {
        if (item.stock_status === 'out_of_stock') {
          throw new Error(`${item.game_name} (${item.platform_name}) is out of stock`);
        }
      }

      // Calculate totals
      let subtotal = 0;
      let discountTotal = 0;

      for (const item of cartItems) {
        subtotal += parseFloat(item.base_price) * item.quantity;
        discountTotal += (parseFloat(item.base_price) - parseFloat(item.final_price)) * item.quantity;
      }

      const total = subtotal - discountTotal;
      const orderNumber = generateOrderNumber();

      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, order_number, status, subtotal, discount_total, total, payment_status)
         VALUES (?, ?, 'completed', ?, ?, ?, 'paid')`,
        [userId, orderNumber, subtotal.toFixed(2), discountTotal.toFixed(2), total.toFixed(2)]
      );

      const orderId = orderResult.insertId;

      // Create order items with serial keys (one per copy)
      const orderItems = [];
      for (const item of cartItems) {
        const keys = Array.from({ length: item.quantity }, () => generateSerialKey());
        const serialKey = keys.join('|');
        await connection.execute(
          `INSERT INTO order_items (order_id, game_platform_id, game_name, platform_name, edition_name, base_price, discount_percent, final_price, quantity, serial_key)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.game_platform_id, item.game_name, item.platform_name, item.edition_name, item.base_price, item.discount_percent, item.final_price, item.quantity, serialKey]
        );
        orderItems.push({ ...item, serial_key: serialKey });
      }

      // Clear cart
      await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

      await connection.commit();

      return {
        id: orderId,
        order_number: orderNumber,
        status: 'completed',
        subtotal: subtotal.toFixed(2),
        discount_total: discountTotal.toFixed(2),
        total: total.toFixed(2),
        items: orderItems,
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
};

module.exports = orderService;
