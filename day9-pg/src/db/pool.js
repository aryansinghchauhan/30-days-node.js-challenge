const { pool }= require('pg');
const config = require('../config');
const { idleTimeoutMillis } = require('pg/lib/defaults');

const pool = new Pool({
    host:               config.db.host,
    port:               config.db.port,
    database:           config.db.name,
    user:               config.db.user,
    password:           config.db.password,
    min:                config.db.pool.min,
    max:                config.db.pool.max,
    idleTimeoutMillis:   30000,
    connectionTimeoutMillis: 5000,

});
async function query(text,params){
    const start=Date.now();
    try{
        const result=await pool.query(text,params);
        const duration =Date.now()-start;
        if(config.isDev && duration>100){
            console.warn(`[SLOW QUERY] ${duration}ms`,text);
        }
        return result;
    } catch(err) {
        console.error('[DB ERROR]', err.message);
        throw err;
    }
}

async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function checkConnection() {
  try {
    const result = await query('SELECT NOW() as time');
    console.log('[DB] Connected. Server time:', result.rows[0].time);
    return true;
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    return false;
  }
}

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

module.exports = { query, transaction, checkConnection, pool };