const axios = require('axios');
const bcrypt = require('bcrypt');
const { google } = require('googleapis');
const path = require('path');
const configFacebook = require('../config/config-facebook-oauth.json');
const configGoogle = require('../config/config-google-oauth.json');
const db = require('../db');
const { generateToken, validateToken, tokenState } = require('../helper/tokenHandler');
const { getFavourites, getOrderHistory } = require('../helper/objectBuilder');
const { registerUser } = require('./userController');

const BC_SALT_ROUNDS = 10;
const oauth2 = google.oauth2('v2');

const Oauth2Client = new google.auth.OAuth2(
  process.env.AUTH_GOOGLE_CLIENT_ID || configGoogle.clientId,
  process.env.AUTH_GOOGLE_CLIENT_SECRET || configGoogle.clientSecret,
  (typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV.trim() === 'production')
    ? configGoogle.productionCallback : configGoogle.devCallback
);

// TODO: Check if account is active
const loginUser = (userEmail, userName, response) => db.query(
  'SELECT userid, name, surname, email, password, theme, checkedin'
  + ' FROM public.person WHERE person.email = $1::text',
  [userEmail]
)
// eslint-disable-next-line consistent-return
  .then((res) => {
    if (res.rows.length === 0) {
      // user does not exist - create account
      const newUserAccount = {};
      const userFName = userName.split(' ');
      newUserAccount.requestType = 'register';
      // eslint-disable-next-line prefer-destructuring
      newUserAccount.name = userFName[0];
      newUserAccount.surname = (userFName.length > 1) ? userFName[1] : '';
      newUserAccount.email = userEmail;
      newUserAccount.password = Math.random().toString(36).substring(2); // random password
      return Promise.resolve(registerUser(newUserAccount, {}, true))
        .then((regRes) => {
          if (regRes.status === 201) {
            // attempt to login with new account
            return loginUser(userEmail, userName, response);
          }

          // User registration failed
          return response.status(regRes.status).send(regRes);
        })
        .catch((err) => {
          console.error('Query Error [Register Customer - Check Account Availability]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
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
  checkUAToken: (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    return response.status(200).send({
      tokenValid: (userToken.state === tokenState.VALID),
      userId: (userToken.state === tokenState.VALID) ? userToken.data.userId : 0
    });
  },
  getFacebookLoginURL: (reqBody, response) => {
    // Generate Facebook authentication URL
    let fbLoginURL = `https://www.facebook.com/${configFacebook.apiVersion}/dialog/oauth`;
    fbLoginURL += '?response_type=token';
    fbLoginURL += '&display=popup'; // mobile displays
    fbLoginURL += '&auth_type=rerequest';
    fbLoginURL += `&client_id=${process.env.AUTH_FACEBOOK_CLIENT_ID || configFacebook.clientId}`;
    fbLoginURL += '&redirect_uri=';
    fbLoginURL += (typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV.trim() === 'production')
      ? configFacebook.productionCallback : configFacebook.devCallback;
    fbLoginURL += '&scope=email';

    const oauthLoginResponse = {};
    oauthLoginResponse.url = fbLoginURL;

    return response.status(302).send(oauthLoginResponse);
  },
  getGoogleLoginURL: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (Object.keys(reqBody).length !== 1) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Get authentication URL
    const oauthLoginResponse = {};
    oauthLoginResponse.url = Oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['email', 'profile']
    });

    return response.status(302).send(oauthLoginResponse);
  },
  handleFacebookCallback: async (urlParams, response) => response.sendFile(path.resolve('api/public/fb-login.html')),
  handleFacebookCallbackPost: async (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
    || Object.keys(reqBody).length !== 1) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Generate Facebook Graph API URL
    let fbGraphApiURL = `https://graph.facebook.com/${configFacebook.apiVersion}/me`;
    fbGraphApiURL += '?fields=id,name,email'; // required permissions
    fbGraphApiURL += `&access_token=${reqBody.token}`;
    return axios.get(fbGraphApiURL)
      .then((res) => {
        if (typeof res.data.email !== 'undefined' && typeof res.data.name !== 'undefined') {
          return loginUser(res.data.email, res.data.name, response);
        }

        return response.status(401).send({ status: 401, reason: 'Facebook Email Permission Required' });
      })
      .catch((err) => {
        console.error('Facebook OAUTH2 Callback Error', err.stack);
        return response.status(400).send({ status: 400, reason: 'Bad Request' });
      });
  },

  handleGoogleCallback: async (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'code')
    || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }
    try {
      const { tokens } = await Oauth2Client.getToken(reqBody.code);
      Oauth2Client.setCredentials(tokens);
      const userInfo = await oauth2.userinfo.get({ auth: Oauth2Client });
      return loginUser(userInfo.data.email, userInfo.data.name, response);
    } catch (err) {
      console.error('Google OAUTH2 Callback Error', err.stack);
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }
  }
};
