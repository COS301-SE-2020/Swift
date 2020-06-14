'use strict'

const Pool = require('pg').Pool;
const config = require('./config.json');

const pool = new Pool({
    user: process.env.DB_USER || config.user,
    host: process.env.DB_HOST || config.host,
    database: process.env.DB_NAME || config.database,
    password: process.env.DB_PASS || config.password,
    port: process.env.DB_PORT || config.port
});

module.exports = pool;
