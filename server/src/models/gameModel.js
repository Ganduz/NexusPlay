const pool = require('../config/db');

const gameModel = {
  async findBySlug(slug) {
    const [rows] = await pool.execute(
      'SELECT * FROM games WHERE slug = ? AND active = TRUE',
      [slug]
    );
    return rows[0] || null;
  },

  async findByRawgId(rawgId) {
    const [rows] = await pool.execute(
      'SELECT * FROM games WHERE rawg_id = ? AND active = TRUE',
      [rawgId]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM games WHERE id = ? AND active = TRUE',
      [id]
    );
    return rows[0] || null;
  },

  async getHomepageSections() {
    const [featured] = await pool.execute(
      `SELECT g.*,
              MIN(gp.final_price) as min_price,
              MAX(gp.discount_percent) as max_discount
       FROM games g
       LEFT JOIN game_platforms gp ON g.id = gp.game_id AND gp.active = TRUE
       WHERE g.featured = TRUE AND g.active = TRUE
       GROUP BY g.id
       ORDER BY g.updated_at DESC
       LIMIT 6`
    );

    const [newReleases] = await pool.execute(
      `SELECT g.*,
              MIN(gp.final_price) as min_price,
              MAX(gp.discount_percent) as max_discount
       FROM games g
       LEFT JOIN game_platforms gp ON g.id = gp.game_id AND gp.active = TRUE
       WHERE g.is_new = TRUE AND g.active = TRUE
       GROUP BY g.id
       ORDER BY g.release_date DESC
       LIMIT 12`
    );

    const [trending] = await pool.execute(
      `SELECT g.*,
              MIN(gp.final_price) as min_price,
              MAX(gp.discount_percent) as max_discount
       FROM games g
       LEFT JOIN game_platforms gp ON g.id = gp.game_id AND gp.active = TRUE
       WHERE g.is_trending = TRUE AND g.active = TRUE
       GROUP BY g.id
       ORDER BY g.updated_at DESC
       LIMIT 12`
    );

    const [preorders] = await pool.execute(
      `SELECT g.*,
              MIN(gp.final_price) as min_price,
              MAX(gp.discount_percent) as max_discount
       FROM games g
       LEFT JOIN game_platforms gp ON g.id = gp.game_id AND gp.active = TRUE
       WHERE g.is_preorder = TRUE AND g.active = TRUE
       GROUP BY g.id
       ORDER BY g.release_date ASC
       LIMIT 12`
    );

    const [bestDeals] = await pool.execute(
      `SELECT g.*,
              MIN(gp.final_price) as min_price,
              MAX(gp.discount_percent) as max_discount
       FROM games g
       JOIN game_platforms gp ON g.id = gp.game_id AND gp.active = TRUE
       WHERE g.active = TRUE AND gp.discount_percent > 0
       GROUP BY g.id
       ORDER BY max_discount DESC
       LIMIT 12`
    );

    return { featured, newReleases, trending, preorders, bestDeals };
  },

  async findAll({ page = 1, limit = 20, platform, minPrice, maxPrice, sort, search }) {
    let query = `
      SELECT g.*,
             MIN(gp.final_price) as min_price,
             MAX(gp.discount_percent) as max_discount,
             MIN(gp.base_price) as min_base_price
      FROM games g
      LEFT JOIN game_platforms gp ON g.id = gp.game_id AND gp.active = TRUE
    `;

    const conditions = ['g.active = TRUE'];
    const params = [];

    if (platform) {
      query += ' JOIN platforms p ON gp.platform_id = p.id';
      conditions.push('p.slug = ?');
      params.push(platform);
    }

    if (search) {
      conditions.push('g.name LIKE ?');
      params.push(`%${search}%`);
    }

    query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY g.id';

    if (minPrice) {
      query += ' HAVING min_price >= ?';
      params.push(parseFloat(minPrice));
      if (maxPrice) {
        query += ' AND min_price <= ?';
        params.push(parseFloat(maxPrice));
      }
    } else if (maxPrice) {
      query += ' HAVING min_price <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Sort
    const sortMap = {
      'price:asc': 'min_price ASC',
      'price:desc': 'min_price DESC',
      'name:asc': 'g.name ASC',
      'name:desc': 'g.name DESC',
      'release:desc': 'g.release_date DESC',
      'release:asc': 'g.release_date ASC',
      'discount:desc': 'max_discount DESC',
    };
    query += ` ORDER BY ${sortMap[sort] || 'g.name ASC'}`;

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    return {
      games: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getGamesByPlatform(platformSlug, limit = 12) {
    const [rows] = await pool.execute(
      `SELECT g.*,
              MIN(gp.final_price) as min_price,
              MAX(gp.discount_percent) as max_discount
       FROM games g
       JOIN game_platforms gp ON g.id = gp.game_id AND gp.active = TRUE
       JOIN platforms p ON gp.platform_id = p.id
       WHERE g.active = TRUE AND p.slug = ?
       GROUP BY g.id
       ORDER BY g.updated_at DESC
       LIMIT ?`,
      [platformSlug, limit]
    );
    return rows;
  },

  async searchByName(query, limit = 10) {
    const [rows] = await pool.execute(
      `SELECT g.id, g.rawg_id, g.slug, g.name,
              MIN(gp.final_price) as min_price,
              MAX(gp.discount_percent) as max_discount
       FROM games g
       LEFT JOIN game_platforms gp ON g.id = gp.game_id AND gp.active = TRUE
       WHERE g.active = TRUE AND g.name LIKE ?
       GROUP BY g.id
       ORDER BY g.name ASC
       LIMIT ?`,
      [`%${query}%`, limit]
    );
    return rows;
  },
};

module.exports = gameModel;
