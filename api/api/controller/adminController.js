const bcrypt = require('bcrypt');
const validator = require('email-validator');
const db = require('../db');
const accCreator = require('../helper/accountCreator');
const SendEmail = require('../helper/Notifications/SendEmail');
const { generateToken } = require('../helper/tokenHandler');

const BC_SALT_ROUNDS = 10;

module.exports = {
  loginAdmin: async (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'email')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'password')
    || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const { email, password } = reqBody;

    // Check that email is valid
    if (!validator.validate(email)) {
      // invalid email
      return response.status(400).send({ status: 400, reason: 'Invalid Email' });
    }

    // Check if user exists
    // TODO: Check if account is active
    return db.query(
      'SELECT person.userid, person.name, person.surname, person.email, person.password,'
      + ' adminuser.restaurantid FROM public.person'
      + ' INNER JOIN public.adminuser ON adminuser.userid = person.userid'
      + ' WHERE person.email = $1::text',
      [email]
    )
      .then((res) => {
        if (res.rows.length === 0) {
          // user does not exist
          return response.status(404).send({ status: 404, reason: 'Not Found' });
        }

        // Check if credentials are correct
        if (bcrypt.compareSync(password, res.rows[0].password)) {
          // good credentials
          const loginResponse = {};
          const newTokenPair = generateToken(res.rows[0].userid, true);
          loginResponse.token = newTokenPair.token;
          loginResponse.refreshToken = newTokenPair.refreshToken;
          loginResponse.name = res.rows[0].name;
          loginResponse.surname = res.rows[0].surname;
          loginResponse.email = res.rows[0].email;
          loginResponse.restaurantIds = [];

          // Update token in DB - async
          db.query(
            'UPDATE public.person SET refreshtoken = $1::text WHERE userid = $2::integer;',
            [bcrypt.hashSync(newTokenPair.refreshToken, BC_SALT_ROUNDS), res.rows[0].userid]
          )
            .catch((err) => {
              console.error('Query Error [Login - Update Account Token]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });

          // get restaurants user is an admin for
          res.rows.forEach((rId) => {
            // ignore placeholder restaurant
            if (rId.restaurantid !== 0) {
              loginResponse.restaurantIds.push(rId.restaurantid);
            }
          });

          return response.status(200).send(loginResponse);
        }

        // Access denied
        return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
      })
      .catch((err) => {
        console.error('Query Error [Login - Check Account Existence]', err.stack);
        return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
      });
  },
  registerAdmin: async (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'name')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'surname')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'email')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'password')
    || Object.keys(reqBody).length !== 5) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const newUserData = {};
    newUserData.name = reqBody.name;
    newUserData.surname = reqBody.surname;
    newUserData.email = reqBody.email;
    newUserData.password = bcrypt.hashSync(reqBody.password, BC_SALT_ROUNDS); // Hash password
    newUserData.restaurantId = 0; // placeholder restaurant
    newUserData.refreshToken = 'inactive';

    // Check that email is valid
    if (!validator.validate(newUserData.email)) {
      // invalid email
      return response.status(400).send({ status: 400, reason: 'Invalid Email' });
    }

    // check if user exists first - be careful of SQL injection
    return db.query(
      'SELECT userid FROM public.person WHERE email = $1::text;',
      [newUserData.email]
    )
      .then((res) => {
        if (res.rows.length > 0) {
          // user exists
          return response.status(409).send({ status: 409, reason: 'Account Already Exists' });
        }

        // Create new account
        // TODO: Generate and send user account activation email-Done
        return accCreator.createAdmin(newUserData)
          .then(() => response.status(201).send({ status: 201, reason: 'Admin Account Created' }),
          SendEmail.RegistrationEmail(newUserData) )//sends account activation email
          .catch((err) => {
            console.error('Query Error [Register Admin - Create Admin Account]', err.stack);
            return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
          });
      })
      .catch((err) => {
        console.error('Query Error [Register Admin - Check Account Availability]', err.stack);
        return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
      });
  }
};
