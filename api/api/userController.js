const bcrypt = require('bcrypt');
const validator = require('email-validator');
// const { response } = require('express');

const db = require('./db');

// TODO: Remove hardcoded token
const userToken = '728b540dae2a49b5f7f752a8b84037fb1';

module.exports = {
  loginUser: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'email') || !Object.prototype.hasOwnProperty.call(reqBody, 'password')) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const useremail = reqBody.email;
    const { password } = reqBody;

    // Check that email is valid
    if (!validator.validate(useremail)) {
      // invalid email
      return response.status(400).send({ status: 403, reason: 'Invalid Email' });
    }

    // Check if user exists
    return db.query(
      'SELECT userid, username, password FROM public.customer WHERE email = $1::text',
      [useremail]
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
          loginResponse.token = userToken;
          loginResponse.username = res.rows[0].username;
          loginResponse.orderHistory = [];

          const { userid } = res.rows[0];
          // order query promises
          const orderQueries = [];

          return db.query(
            'SELECT orderid, orderstatus, orderdatetime, restaurant.restaurantname, restaurant.location FROM public.foodorder INNER JOIN public.restauranttable ON public.foodorder.tableid = public.restauranttable.tableid INNER JOIN public.restaurant ON public.restaurant.restaurantid = public.restauranttable.restaurantid WHERE customerid = $1::integer;',
            [userid]
          )
            .then((res) => {
            // get data
              for (let i = 0; i < res.rows.length; i++) {
                loginResponse.orderHistory[i] = {};
                loginResponse.orderHistory[i].total = 0.0;
                loginResponse.orderHistory[i].orderNumber = res.rows[i].orderid;
                loginResponse.orderHistory[i].restaurant = res.rows[i].restaurantname;
                loginResponse.orderHistory[i].location = res.rows[i].location;
                loginResponse.orderHistory[i].date = res.rows[i].orderdatetime;
                loginResponse.orderHistory[i].orderItems = [];

                const orderid = loginResponse.orderHistory[i].orderNumber;

                const orderQuery = async (index, orderid) => {
                  const queryPromise = new Promise((resolve, reject) => {
                    db.query(
                      'SELECT menuitemname, price, orderitem.quantity, menuitemimages.imageurl FROM public.menuitem INNER JOIN public.orderitem ON public.orderitem.menuitemid = public.menuitem.menuitemid LEFT JOIN public.menuitemimages ON public.menuitemimages.menuitemid = public.menuitem.menuitemid WHERE orderitem.orderid = $1::integer;',
                      [orderid]
                    )
                      .then((res) => {
                        // each item ordered
                        for (let m = 0; m < res.rows.length; m++) {
                          loginResponse.orderHistory[index].orderItems[m] = {};
                          loginResponse.orderHistory[index].orderItems[m].name = res.rows[m].menuitemname;
                          loginResponse.orderHistory[index].orderItems[m].quantity = res.rows[m].quantity;
                          loginResponse.orderHistory[index].orderItems[m].price = res.rows[m].price;
                          loginResponse.orderHistory[index].orderItems[m].image = res.rows[m].imageurl;
                          // update total price
                          loginResponse.orderHistory[index].total += (
                            res.rows[m].price * res.rows[m].quantity
                          );
                        }
                        resolve();
                      })
                      .catch((err) => {
                        reject(err);
                      });
                  });

                  // wait until the query is complete
                  await queryPromise;
                };

                orderQueries.push(orderQuery(i, orderid));
              }

              Promise.all(orderQueries).then(() => response.status(200).send(loginResponse))
                .catch((err) => {
                  console.error('Error executing query', err.stack);
                  return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
                });
            })
            .catch((err) => {
              console.error('Error executing query', err.stack);
              return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
            });
        }

        // Access denied
        return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
      })
      .catch((err) => {
        console.error('Error executing query', err.stack);
        return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
      });
  },
  registerUser: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'name') || !Object.prototype.hasOwnProperty.call(reqBody, 'surname')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'username') || !Object.prototype.hasOwnProperty.call(reqBody, 'email')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'password')) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const firstname = reqBody.name;
    const { surname } = reqBody;
    const { username } = reqBody;
    const useremail = reqBody.email;
    const password = bcrypt.hashSync(reqBody.password, 10); // Hash password
    const userTheme = 'Light'; // Default light theme

    // Check that email is valid
    if (!validator.validate(useremail)) {
      // invalid email
      return response.status(400).send({ status: 403, reason: 'Invalid Email' });
    }

    // check if user exists first - be careful of SQL injection
    return db.query(
      'SELECT userid FROM public.customer WHERE username = $1::text OR email = $2::text',
      [username, useremail]
    )
      .then((res) => {
        if (res.rows.length > 0) {
          // user exists
          return response.status(409).send({
            status: 409, reason: 'Customer Already Exists', dsf: 5, dsfq: 5, dswf: 5, dersf: 5, drewsf: 5, dsrwef: 5, dwersf: 5, dsfdsf: 5, dfs: 554
          });
        }

        // create new account
        return db.query(
          'INSERT INTO public.customer (name, surname, email, username, password, theme) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::text) RETURNING username;',
          [firstname, surname, useremail, username, password, userTheme]
        )
          .then((res) => response.status(201).send({
            token: userToken,
            username: res.rows[0].username
          }))
          .catch((err) => {
            console.error('Error executing query', err.stack);
            return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
          });
      })
      .catch((err) => {
        console.error('Error executing query', err.stack);
        return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
      });
  }
};
