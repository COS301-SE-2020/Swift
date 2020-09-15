const { Pool } = require('pg');
const configDB = require('./config/config-db.json');

// cache db pool
let pool;
if (pool == null) {
  pool = new Pool({
    user: process.env.DB_USER || configDB.user,
    host: process.env.DB_HOST || configDB.host,
    database: process.env.DB_NAME || configDB.database,
    password: process.env.DB_PASS || configDB.password,
    port: process.env.DB_PORT || configDB.port,
    connectionTimeoutMillis: 0, // wait forever until a connection is available
    idleTimeoutMillis: 5000, // release unused connections after 5 sec
    max: 20
  });
}

module.exports = pool;
