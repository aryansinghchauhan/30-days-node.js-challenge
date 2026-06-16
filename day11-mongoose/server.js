require('dotenv').config();

const app         = require('./src/app');
const config      = require('./src/config');
const { connectDB } = require('./src/db/mongoose');

async function start() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log('─────────────────────────────────────');
    console.log('  Blog API — Mongoose + MongoDB');
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
      const { mongoose } = require('./src/db/mongoose');
      await mongoose.disconnect();
      process.exit(0);
    });
  });
}

start();