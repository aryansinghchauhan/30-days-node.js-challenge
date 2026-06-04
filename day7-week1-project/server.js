require('dotenv').config();

const app    = require('./src/app');
const config = require('./src/config');

const server = app.listen(config.port, () => {
  console.log('─────────────────────────────────────');
  console.log(`  Notes API`);
  console.log(`  http://localhost:${config.port}/${config.api.version}`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log('─────────────────────────────────────');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM — shutting down gracefully');
  server.close(() => process.exit(0));
});