const pool = require('../config/db');

const gamePlatformModel = {
  async findByGameId(gameId) {
    const [rows] = await pool.execute(
      `SELECT gp.*, p.name as platform_name, p.slug as platform_slug, p.icon as platform_icon,
              ge.name as edition_name, ge.slug as edition_slug
       FROM game_platforms gp
       JOIN platforms p ON gp.platform_id = p.id
       JOIN game_editions ge ON gp.edition_id = ge.id
       WHERE gp.game_id = ? AND gp.active = TRUE
       ORDER BY p.sort_order ASC, ge.sort_order ASC`,
      [gameId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT gp.*, p.name as platform_name, p.slug as platform_slug,
              ge.name as edition_name, ge.slug as edition_slug,
              g.name as game_name, g.slug as game_slug, g.rawg_id
       FROM game_platforms gp
       JOIN platforms p ON gp.platform_id = p.id
       JOIN game_editions ge ON gp.edition_id = ge.id
       JOIN games g ON gp.game_id = g.id
       WHERE gp.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async getGroupedByPlatform(gameId) {
    const rows = await this.findByGameId(gameId);

    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.platform_slug]) {
        grouped[row.platform_slug] = {
          platform_id: row.platform_id,
          platform_name: row.platform_name,
          platform_slug: row.platform_slug,
          platform_icon: row.platform_icon,
          editions: [],
        };
      }
      grouped[row.platform_slug].editions.push({
        id: row.id,
        edition_name: row.edition_name,
        edition_slug: row.edition_slug,
        base_price: row.base_price,
        discount_percent: row.discount_percent,
        final_price: row.final_price,
        stock_status: row.stock_status,
        delivery_type: row.delivery_type,
      });
    }

    return Object.values(grouped);
  },

  async getAllPlatforms() {
    const [rows] = await pool.execute(
      'SELECT * FROM platforms ORDER BY sort_order ASC'
    );
    return rows;
  },
};

module.exports = gamePlatformModel;
