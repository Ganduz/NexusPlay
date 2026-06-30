const mysql = require('mysql2/promise');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const {
  games,
  priceTiers,
  getGameTier,
  randomInRange,
  randomInt,
  testUsers,
  sampleReviews,
  editionTypes,
} = require('./seedData');

const RAWG_API_KEY = process.env.RAWG_API_KEY || '86c97529629b42e7bb2de79c8a7c7aea';
const RAWG_BASE_URL = process.env.RAWG_BASE_URL || 'https://api.rawg.io/api';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nexusplay',
  });

  try {
    console.log('🌱 Starting seed process...\n');

    // Check if RAWG API key is set
    if (RAWG_API_KEY === 'YOUR_RAWG_API_KEY') {
      console.log('⚠️  RAWG API key not set. Will seed with placeholder data.');
      console.log('   Set RAWG_API_KEY in .env for full data.\n');
    }

    // Clean existing data (reverse FK order)
    console.log('🧹 Cleaning existing data...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['review_votes', 'reviews', 'wishlist', 'order_items', 'orders', 'cart_items', 'game_platforms', 'game_editions', 'games', 'users'];
    for (const table of tables) {
      await connection.execute(`TRUNCATE TABLE ${table}`);
    }
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('   Done.\n');

    // Get platform IDs
    const [platforms] = await connection.execute('SELECT id, slug FROM platforms');
    const platformMap = {};
    platforms.forEach(p => { platformMap[p.slug] = p.id; });
    console.log('📋 Platforms loaded:', Object.keys(platformMap).join(', '));

    // Seed users
    console.log('\n👤 Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const userIds = [];
    for (const user of testUsers) {
      const [result] = await connection.execute(
        `INSERT INTO users (email, username, password_hash, role, email_verified) VALUES (?, ?, ?, ?, TRUE)`,
        [user.email, user.username, passwordHash, user.role]
      );
      userIds.push(result.insertId);
      console.log(`   ✓ ${user.username} (${user.role})`);
    }

    // Seed games
    console.log('\nSeeding games...');
    const gameIdMap = {}; // slug -> db id
    const gameRawgIdMap = {}; // slug -> rawg_id

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      let rawgId = 0;
      let releaseDate = null;

      // Try to fetch from RAWG
      if (RAWG_API_KEY !== 'YOUR_RAWG_API_KEY') {
        try {
          const response = await axios.get(`${RAWG_BASE_URL}/games/${game.slug}`, {
            params: { key: RAWG_API_KEY },
            timeout: 10000,
          });
          rawgId = response.data.id;
          releaseDate = response.data.released;
          console.log(`   ✓ [RAWG] ${game.name} (ID: ${rawgId})`);
          await delay(200); // Rate limit respect
        } catch (err) {
          console.log(`   ⚠ [RAWG] Failed for ${game.slug}: ${err.message}`);
          rawgId = 100000 + i; // Fallback ID
        }
      } else {
        rawgId = 100000 + i;
        console.log(`   ✓ [LOCAL] ${game.name} (placeholder ID: ${rawgId})`);
      }

      const [result] = await connection.execute(
        `INSERT INTO games (rawg_id, slug, name, release_date, is_new, is_trending, is_preorder, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [rawgId, game.slug, game.name, releaseDate, game.is_new || false, game.is_trending || false, game.is_preorder || false, game.featured || false]
      );

      const gameId = result.insertId;
      gameIdMap[game.slug] = gameId;
      gameRawgIdMap[game.slug] = rawgId;

      // Create editions for this game
      const editionIds = {};
      for (const edition of editionTypes) {
        const [edResult] = await connection.execute(
          `INSERT INTO game_editions (game_id, name, slug, sort_order) VALUES (?, ?, ?, ?)`,
          [gameId, edition.name, edition.slug, edition.sort_order]
        );
        editionIds[edition.slug] = edResult.insertId;
      }

      // Create game_platforms entries
      const tier = getGameTier(game.slug);
      const priceConfig = priceTiers[tier];

      for (const platformSlug of game.platforms) {
        const platformId = platformMap[platformSlug];
        if (!platformId) continue;

        // Standard edition - base price
        const basePrice = randomInRange(priceConfig.base[0], priceConfig.base[1]);
        const discount = randomInt(priceConfig.discount[0], priceConfig.discount[1]);

        // Round discount to nearest 5
        const roundedDiscount = Math.round(discount / 5) * 5;

        const stockStatus = game.is_preorder ? 'preorder' : 'available';

        await connection.execute(
          `INSERT INTO game_platforms (game_id, platform_id, edition_id, base_price, discount_percent, stock_status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [gameId, platformId, editionIds['standard'], basePrice, roundedDiscount, stockStatus]
        );

        // Deluxe edition - +10-15
        const deluxePrice = Math.round((basePrice + randomInRange(10, 15)) * 100) / 100;
        await connection.execute(
          `INSERT INTO game_platforms (game_id, platform_id, edition_id, base_price, discount_percent, stock_status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [gameId, platformId, editionIds['deluxe'], deluxePrice, Math.max(0, roundedDiscount - 5), stockStatus]
        );

        // Ultimate edition - +20-30
        const ultimatePrice = Math.round((basePrice + randomInRange(20, 30)) * 100) / 100;
        await connection.execute(
          `INSERT INTO game_platforms (game_id, platform_id, edition_id, base_price, discount_percent, stock_status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [gameId, platformId, editionIds['ultimate'], ultimatePrice, Math.max(0, roundedDiscount - 10), stockStatus]
        );
      }
    }

    // Seed reviews
    console.log('\n📝 Seeding reviews...');
    for (const review of sampleReviews) {
      const gameId = gameIdMap[review.gameSlug];
      if (!gameId) continue;

      await connection.execute(
        `INSERT INTO reviews (user_id, game_id, rating, title, body) VALUES (?, ?, ?, ?, ?)`,
        [userIds[review.userIdx], gameId, review.rating, review.title, review.body]
      );
      console.log(`   ✓ Review for ${review.gameSlug} by user ${review.userIdx}`);
    }

    // Seed wishlist (random items for test users)
    console.log('\nSeeding wishlist...');
    const gameSlugs = Object.keys(gameIdMap);
    for (let userIdx = 1; userIdx < userIds.length; userIdx++) {
      const numWishlist = randomInt(3, 6);
      const shuffled = [...gameSlugs].sort(() => Math.random() - 0.5);
      for (let j = 0; j < numWishlist && j < shuffled.length; j++) {
        const gameId = gameIdMap[shuffled[j]];
        await connection.execute(
          `INSERT IGNORE INTO wishlist (user_id, game_id) VALUES (?, ?)`,
          [userIds[userIdx], gameId]
        );
      }
      console.log(`   ✓ ${numWishlist} items for user ${testUsers[userIdx].username}`);
    }

    // Seed sample orders
    console.log('\n📦 Seeding sample orders...');
    for (let userIdx = 1; userIdx <= 2; userIdx++) {
      const userId = userIds[userIdx];
      const orderNumber = `NXP-${Date.now().toString(36).toUpperCase()}-${userIdx}`;

      // Pick 2-3 random game_platforms
      const [gamePlatforms] = await connection.execute(
        `SELECT gp.id, gp.base_price, gp.discount_percent, gp.final_price,
                g.name as game_name, p.name as platform_name, ge.name as edition_name
         FROM game_platforms gp
         JOIN games g ON gp.game_id = g.id
         JOIN platforms p ON gp.platform_id = p.id
         JOIN game_editions ge ON gp.edition_id = ge.id
         WHERE gp.stock_status = 'available'
         ORDER BY RAND() LIMIT ?`,
        [randomInt(2, 3)]
      );

      let subtotal = 0;
      let discountTotal = 0;
      for (const gp of gamePlatforms) {
        subtotal += parseFloat(gp.base_price);
        discountTotal += parseFloat(gp.base_price) - parseFloat(gp.final_price);
      }
      const total = subtotal - discountTotal;

      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, order_number, status, subtotal, discount_total, total, payment_status)
         VALUES (?, ?, 'completed', ?, ?, ?, 'paid')`,
        [userId, orderNumber, subtotal.toFixed(2), discountTotal.toFixed(2), total.toFixed(2)]
      );

      for (const gp of gamePlatforms) {
        const serialKey = `NXPY-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await connection.execute(
          `INSERT INTO order_items (order_id, game_platform_id, game_name, platform_name, edition_name, base_price, discount_percent, final_price, serial_key)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderResult.insertId, gp.id, gp.game_name, gp.platform_name, gp.edition_name, gp.base_price, gp.discount_percent, gp.final_price, serialKey]
        );
      }
      console.log(`   ✓ Order ${orderNumber} for ${testUsers[userIdx].username} (${gamePlatforms.length} items)`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`   Games: ${games.length}`);
    console.log(`   Users: ${testUsers.length}`);
    console.log(`   Reviews: ${sampleReviews.length}`);
    console.log(`   Orders: 2 sample orders`);

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
