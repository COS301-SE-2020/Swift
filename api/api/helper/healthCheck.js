const axios = require('axios');
const db = require('../db').poolr;
const dbw = require('../db').poolw;
const configDB = require('../config/config-db.json');

module.exports = {
  getServiceStatus: async (res) => {
    const serviceStatus = {};
    serviceStatus.timestamp = `${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} (UTC)`;
    serviceStatus.API = {};
    serviceStatus.MLAPI = {};
    serviceStatus.DB0 = {};
    serviceStatus.DB1 = {};
    serviceStatus.docs = {};
    serviceStatus.ManagementWebApp = {};
    serviceStatus.UserWebApp = {};

    // API self-test
    await axios.get('https://api.swiftapp.ml')
      .then((ares) => {
        if (ares.status === 200) {
          serviceStatus.API.status = 200;
          serviceStatus.API.detail = 'API is online';
        } else {
          serviceStatus.API.status = 503;
          serviceStatus.API.detail = 'API is offline';
        }
      })
      .catch(() => {
        serviceStatus.API.status = 503;
        serviceStatus.API.detail = 'API is offline';
      });

    await axios.get('https://ml.api.swiftapp.ml')
      .then((ares) => {
        if (ares.status === 200) {
          serviceStatus.MLAPI.status = 200;
          serviceStatus.MLAPI.detail = 'ML API is online';
        } else {
          serviceStatus.MLAPI.status = 503;
          serviceStatus.MLAPI.detail = 'ML API is offline';
        }
      })
      .catch(() => {
        serviceStatus.MLAPI.status = 503;
        serviceStatus.MLAPI.detail = 'ML API is offline';
      });

    // Check DB availability
    // DB-0
    if (dbw != null && dbw.options.database === (process.env.DB_NAME || configDB.database)) {
      await (async () => {
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if DB is responding to queries
          const db0Stat = await client.query('SELECT 1 AS "Online"');

          if (db0Stat.rows.length === 0) {
            // db error
            serviceStatus.DB0.status = 503;
            serviceStatus.DB0.detail = 'Database-0 is offline';
          }

          // commit changes
          client.query('COMMIT');

          // db1 is online
          serviceStatus.DB0.status = 200;
          serviceStatus.DB0.detail = 'Database-0 is online';
        } catch (err) {
          // rollback changes
          await client.query('ROLLBACK');

          // throw error for async catch
          throw err;
        } finally {
          // close connection
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Healthcheck - Test DB0]', err.stack);
          serviceStatus.DB0.status = 503;
          serviceStatus.DB0.detail = 'Database-0 is offline';
        });
    } else {
      serviceStatus.DB0.status = 503;
      serviceStatus.DB0.detail = 'Database-0 is offline';
    }

    // DB-1
    if (db != null && db.options.database === (process.env.DB_NAME || configDB.database)) {
      await (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if DB is responding to queries
          const db1Stat = await client.query('SELECT 1 AS "Online"');

          if (db1Stat.rows.length === 0) {
            // db error
            serviceStatus.DB1.status = 503;
            serviceStatus.DB1.detail = 'Database-1 is offline';
          }

          // commit changes
          client.query('COMMIT');

          // db1 is online
          serviceStatus.DB1.status = 200;
          serviceStatus.DB1.detail = 'Database-1 is online';
        } catch (err) {
          // rollback changes
          await client.query('ROLLBACK');

          // throw error for async catch
          throw err;
        } finally {
          // close connection
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Healthcheck - Test DB1]', err.stack);
          serviceStatus.DB1.status = 503;
          serviceStatus.DB1.detail = 'Database-1 is offline';
        });
    } else {
      serviceStatus.DB1.status = 503;
      serviceStatus.DB1.detail = 'Database-1 is offline';
    }

    // Check user apps
    await axios.get('https://app.swiftapp.ml')
      .then((ures) => {
        if (ures.status === 200) {
          serviceStatus.UserWebApp.status = 200;
          serviceStatus.UserWebApp.detail = 'User Web App is online';
        } else {
          serviceStatus.UserWebApp.status = 503;
          serviceStatus.UserWebApp.detail = 'User Web App is offile';
        }
      })
      .catch(() => {
        serviceStatus.UserWebApp.status = 503;
        serviceStatus.UserWebApp.detail = 'User Web App is offile';
      });

    await axios.get('https://manage.swiftapp.ml')
      .then((ares) => {
        if (ares.status === 200) {
          serviceStatus.ManagementWebApp.status = 200;
          serviceStatus.ManagementWebApp.detail = 'Management Web App is online';
        } else {
          serviceStatus.ManagementWebApp.status = 503;
          serviceStatus.ManagementWebApp.detail = 'Management Web App is offile';
        }
      })
      .catch(() => {
        serviceStatus.ManagementWebApp.status = 503;
        serviceStatus.ManagementWebApp.detail = 'Management Web App is offile';
      });

    await axios.get('https://docs.swiftapp.ml')
      .then((dres) => {
        if (dres.status === 200) {
          serviceStatus.docs.status = 200;
          serviceStatus.docs.detail = 'Documentation is online';
        } else {
          serviceStatus.docs.status = 503;
          serviceStatus.docs.detail = 'Documentation is offile';
        }
      })
      .catch(() => {
        serviceStatus.docs.status = 503;
        serviceStatus.docs.detail = 'Documentation is offile';
      });

    return res.status(200).send(serviceStatus);
  }
};
