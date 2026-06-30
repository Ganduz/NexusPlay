const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('Running database migration...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schema);

    console.log('✅ Database migration completed successfully!');
    console.log('   Database: nexusplay');
    console.log('   Tables created: users,');
    console.log('   games, platforms, game_editions, game_platforms, cart_items,');
    console.log('   orders, order_items, wishlist, reviews, review_votes');
    console.log('   Platforms seeded: PC, PlayStation 5, Xbox Series X|S, Nintendo Switch');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
