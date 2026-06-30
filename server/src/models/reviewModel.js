const pool = require('../config/db');

const reviewModel = {
  async findByGameId(gameId, page = 1, limit = 10, userId = null) {
    const offset = (page - 1) * limit;

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE game_id = ?',
      [gameId]
    );
    const total = countResult[0].total;

    const [avgResult] = await pool.execute(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE game_id = ?',
      [gameId]
    );
    const avgRating = avgResult[0].avg_rating ? parseFloat(avgResult[0].avg_rating).toFixed(1) : null;

    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, u.avatar_url,
              (SELECT COUNT(*) FROM review_votes WHERE review_id = r.id AND vote_type = 'up') as upvotes,
              (SELECT COUNT(*) FROM review_votes WHERE review_id = r.id AND vote_type = 'down') as downvotes
              ${userId ? `, (SELECT vote_type FROM review_votes WHERE review_id = r.id AND user_id = ?) as user_vote` : ''}
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.game_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      userId ? [userId, gameId, limit, offset] : [gameId, limit, offset]
    );

    return {
      reviews,
      avgRating,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async create(userId, gameId, { rating, title, body }) {
    const [result] = await pool.execute(
      'INSERT INTO reviews (user_id, game_id, rating, title, body) VALUES (?, ?, ?, ?, ?)',
      [userId, gameId, rating, title || null, body || null]
    );

    const [review] = await pool.execute(
      `SELECT r.*, u.username, u.avatar_url FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?`,
      [result.insertId]
    );
    return review[0];
  },

  async update(reviewId, userId, { rating, title, body }) {
    await pool.execute(
      'UPDATE reviews SET rating = ?, title = ?, body = ?, is_edited = TRUE WHERE id = ? AND user_id = ?',
      [rating, title || null, body || null, reviewId, userId]
    );

    const [review] = await pool.execute(
      `SELECT r.*, u.username, u.avatar_url FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?`,
      [reviewId]
    );
    return review[0];
  },

  async delete(reviewId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );
    return result.affectedRows > 0;
  },

  async vote(reviewId, userId, voteType) {
    // Check existing vote
    const [existing] = await pool.execute(
      'SELECT id, vote_type FROM review_votes WHERE review_id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (existing.length > 0) {
      if (existing[0].vote_type === voteType) {
        // Remove vote
        await pool.execute('DELETE FROM review_votes WHERE id = ?', [existing[0].id]);
        return { action: 'removed' };
      }
      // Change vote
      await pool.execute('UPDATE review_votes SET vote_type = ? WHERE id = ?', [voteType, existing[0].id]);
      return { action: 'changed', vote_type: voteType };
    }

    // New vote
    await pool.execute(
      'INSERT INTO review_votes (review_id, user_id, vote_type) VALUES (?, ?, ?)',
      [reviewId, userId, voteType]
    );
    return { action: 'added', vote_type: voteType };
  },

  async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;

    const [reviews] = await pool.execute(
      `SELECT r.*, g.name as game_name, g.slug as game_slug, g.rawg_id,
              (SELECT COUNT(*) FROM review_votes WHERE review_id = r.id AND vote_type = 'up') as upvotes,
              (SELECT COUNT(*) FROM review_votes WHERE review_id = r.id AND vote_type = 'down') as downvotes
       FROM reviews r
       JOIN games g ON r.game_id = g.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return {
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findUserReviewForGame(userId, gameId) {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );
    return rows[0] || null;
  },
};

module.exports = reviewModel;
