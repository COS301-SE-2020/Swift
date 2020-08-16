const bcrypt = require('bcrypt');
const { google } = require('googleapis');
const config = require('../config-google-oauth.json');
const db = require('../db');
const { generateToken } = require('../helper/tokenHandler');
const { getFavourites, getOrderHistory } = require('../helper/objectBuilder');

const BC_SALT_ROUNDS = 10;
const oauth2 = google.oauth2('v2');

const Oauth2Client = new google.auth.OAuth2(
  process.env.AUTH_GOOGLE_CLIENT_ID || config.clientId,
  process.env.AUTH_GOOGLE_CLIENT_SECRET || config.clientSecret,
  (typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV.trim() === 'production')
    ? config.productionCallback : config.devCallback
);

// TODO: Check if account is active
const loginUser = (userEmail, response) => db.query(
  'SELECT person.userid, person.name, person.surname, person.email,'
    + ' customer.theme FROM public.person'
    + ' INNER JOIN public.customer ON customer.userid = person.userid'
    + ' WHERE person.email = $1::text',
  [userEmail]
)
// eslint-disable-next-line consistent-return
  .then((res) => {
    if (res.rows.length === 0) {
      // user does not exist
      return response.status(404).send({ status: 404, reason: 'Not Found' });
    }

    const loginResponse = {};
    const newTokenPair = generateToken(res.rows[0].userid);
    loginResponse.token = newTokenPair.token;
    loginResponse.refreshToken = newTokenPair.refreshToken;
    loginResponse.name = res.rows[0].name;
    loginResponse.surname = res.rows[0].surname;
    loginResponse.email = res.rows[0].email;
    loginResponse.theme = res.rows[0].theme;

    // Update token in DB - async
    const loginPromises = [];
    loginPromises.push(db.query(
      'UPDATE public.person SET refreshtoken = $1::text WHERE userid = $2::integer;',
      [bcrypt.hashSync(newTokenPair.refreshToken, BC_SALT_ROUNDS), res.rows[0].userid]
    )
      .catch((err) => {
        console.error('Query Error [Login - Update Account Token]', err.stack);
        return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
      }));

    loginPromises.push(getFavourites(res.rows[0].userid).then((favourites) => {
      loginResponse.favourites = favourites;
    }));

    loginPromises.push(new Promise((resolve, reject) => {
      loginPromises.push(getOrderHistory(res.rows[0].userid).then((orderHistoryPromise) => {
        loginResponse.orderHistory = [];
        Promise.all(orderHistoryPromise)
          .then((orderHistoryItem) => {
            orderHistoryItem.forEach((ordHistItem) => {
              loginResponse.orderHistory.push(ordHistItem);
            });
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      }));
    }));

    Promise.all(loginPromises).then(() => response.status(200).send(loginResponse))
      .catch((err) => {
        console.error('Login Promise Error', err.stack);
        return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
      });
  })
  .catch((err) => {
    console.error('Query Error [OAUTH2 Login - Check Account Existence]', err.stack);
    return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
  });

module.exports = {
  getLoginURL: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (Object.keys(reqBody).length !== 1) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Get authentication URL
    const oauthLoginResponse = {};
    oauthLoginResponse.url = Oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: 'email'
    });

    return response.status(302).send(oauthLoginResponse);
  },
  handleGoogleCallback: (urlParams, response) => Oauth2Client.getToken(urlParams.code)
    .then(({ tokens }) => {
      Oauth2Client.setCredentials(tokens);
    })
    .then(() => oauth2.userinfo.get({ auth: Oauth2Client })
      .then((res) => {
        // Login user from authenticated Google account
        loginUser(res.data.email, response);
      }))
    .catch((err) => {
      console.error('Google OAUTH2 Callback Error', err.stack);
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    })
};
