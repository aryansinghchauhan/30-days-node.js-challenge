require('dotenv').config();

const app    = require('./src/app');
const config = require('./src/config');
const prisma = require('./src/db/prisma');

async function start() {
  try {
    await prisma.$connect();
    console.log('[DB] Prisma connected to PostgreSQL');
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log('─────────────────────────────────────');
    console.log('  Blog API — Prisma + PostgreSQL');
    console.log(`  http://localhost:${config.port}/${config.api.version}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log('─────────────────────────────────────');
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

start();