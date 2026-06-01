require('dotenv').config();
const app    = require('./src/app');
const config = require('./src/config');

const server = app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port} [${config.nodeEnv}]`);
  console.log(`API available at http://localhost:${config.port}/${config.api.version}`);
});