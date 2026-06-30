const app = require('./app');
const env = require('./config/env');

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║              NexusPlay API Server            ║
  ╠══════════════════════════════════════════════╣
  ║  Port:        ${String(PORT).padEnd(30)} ║
  ║  Environment: ${env.nodeEnv.padEnd(30)} ║
  ║  RAWG API:    ${(env.rawg.apiKey ? 'Configured' : 'Not set').padEnd(30)} ║
  ║  Database:    ${env.db.database.padEnd(30)} ║
  ╚══════════════════════════════════════════════╝
  `);
});
