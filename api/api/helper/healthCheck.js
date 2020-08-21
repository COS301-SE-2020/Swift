const axios = require('axios');
const db = require('../db');

module.exports = {
  getServiceStatus: async (res) => {
    const serviceStatus = {};
    serviceStatus.timestamp = `${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} (UTC)`;
    serviceStatus.API = {};
    serviceStatus.DB = {};
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

    // Check DB availability
    if (db != null && db.options.database === 'swift') {
      serviceStatus.DB.status = 200;
      serviceStatus.DB.detail = 'Database is online';
    } else {
      serviceStatus.DB.status = 503;
      serviceStatus.DB.detail = 'Database is offline';
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
