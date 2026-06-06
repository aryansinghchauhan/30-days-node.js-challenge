const config = require('../config');

function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const msg = `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`;

    if (config.isDev) {
      const color =
        res.statusCode >= 500 ? '\x1b[31m' :
        res.statusCode >= 400 ? '\x1b[33m' :
        '\x1b[32m';
      console.log(`${color}${msg}\x1b[0m`);
    } else {
      console.log(JSON.stringify({
        method: req.method,
        path:   req.path,
        status: res.statusCode,
        ms:     duration,
        time:   new Date().toISOString(),
      }));
    }
  });

  next();
}

module.exports = logger;