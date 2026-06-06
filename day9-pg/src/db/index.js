const pool     = require('./pool');
const users    = require('./queries/users');
const posts    = require('./queries/posts');
const comments = require('./queries/comments');

module.exports = {
  query:           pool.query,
  transaction:     pool.transaction,
  checkConnection: pool.checkConnection,
  pool:            pool.pool,
  users,
  posts,
  comments,
};