const { Pool } = require('pg');
const configDB = require('./config/config-db.json');

// cache db pool
let poolr; // load balanced readonly pool
let poolw; // non load balanced writing pool

if (poolr == null) {
  poolr = new Pool({
    user: process.env.DB_USER || configDB.user,
    host: process.env.DB_HOSTR || configDB.hostr,
    database: process.env.DB_NAME || configDB.database,
    password: process.env.DB_PASS || configDB.password,
    port: process.env.DB_PORTR || configDB.portr,
    connectionTimeoutMillis: 0, // wait forever until a connection is available
    idleTimeoutMillis: 5000, // release unused connections after 5 sec
    max: 20
  });
}

if (poolw == null) {
  poolw = new Pool({
    user: process.env.DB_USER || configDB.user,
    host: process.env.DB_HOSTW || configDB.hostw,
    database: process.env.DB_NAME || configDB.database,
    password: process.env.DB_PASS || configDB.password,
    port: process.env.DB_PORTW || configDB.portw,
    connectionTimeoutMillis: 0, // wait forever until a connection is available
    idleTimeoutMillis: 5000, // release unused connections after 5 sec
    max: 20
  });
}

module.exports = { poolr, poolw };
