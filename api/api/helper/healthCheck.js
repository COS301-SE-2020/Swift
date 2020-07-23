const db = require('../db');

module.exports = {
  getServiceStatus: async (res) => {
    const serviceStatus = {};
    serviceStatus.timestamp = `${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} (UTC)`;
    serviceStatus.API = {};
    serviceStatus.DB = {};

    // API has to be online to send this
    serviceStatus.API.status = 200;
    serviceStatus.API.detail = 'API is online';

    // Check DB availability
    if (db != null && db.options.database === 'swift') {
      serviceStatus.DB.status = 200;
      serviceStatus.DB.detail = 'Database is online';
    } else {
      serviceStatus.DB.status = 503;
      serviceStatus.DB.detail = 'Database is offline';
    }

    return res.status(200).send(serviceStatus);
  }
};
