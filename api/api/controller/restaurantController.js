const db = require('../db');
const { validateToken, tokenStatus, getCustomerId } = require('../helper/tokenHandler');
const { getReviews, getRatingPhrases, getMenuCategories } = require('../helper/objectBuilder');

module.exports = {
  getRestaurantList: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
    || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const tokenState = validateToken(reqBody.token);

    if (tokenState === tokenStatus.valid) {
      return db.query(
        'SELECT restaurantid, restaurantname, location, coverimageurl FROM public.restaurant;'
      )
        .then((res) => {
          const restaurantResponse = {};
          const restaurantPromises = [];
          restaurantResponse.restaurants = [];
          for (let r = 0; r < res.rows.length; r++) {
            restaurantResponse.restaurants[r] = {};
            restaurantResponse.restaurants[r].restaurantId = res.rows[r].restaurantid;
            restaurantResponse.restaurants[r].name = res.rows[r].restaurantname;
            restaurantResponse.restaurants[r].location = res.rows[r].location;
            restaurantResponse.restaurants[r].image = res.rows[r].coverimageurl;
            restaurantPromises.push(db.query(
              'SELECT AVG(ratingscore) AS "rating" FROM public.review'
              + ' WHERE restaurantid = $1::integer AND ratingscore IS NOT NULL;',
              [res.rows[r].restaurantid]
            )
              .then((ratingRes) => {
                if (ratingRes.rows[0].rating != null) {
                  restaurantResponse.restaurants[r].rating = ratingRes.rows[0].rating;
                } else {
                  // no rating available
                  restaurantResponse.restaurants[r].rating = 0.0;
                }
              })
              .catch((err) => {
                console.error('Query Error [Restaurant - Get Restaurant Rating]', err.stack);
                // zero rating on error
                restaurantResponse.restaurants[r].rating = 0.0;
              }));
          }

          Promise.all(restaurantPromises).then(() => response.status(200).send(restaurantResponse))
            .catch((err) => {
              console.error('Restaurant Promise Error', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        }).catch((err) => {
          console.error('Query Error [Restaurant - Get Restaurant List]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (tokenState === tokenStatus.refresh) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  checkIn: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'qrcode')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'token')
    || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token validity
    const tokenState = validateToken(reqBody.token, true);
    if (tokenState[0] === tokenStatus.valid) {
      return db.query(
        'SELECT tableid, restaurantid, numseats, status FROM public.restauranttable'
        + ' WHERE qrcode = $1::text;',
        [reqBody.qrcode]
      )
        .then((res) => {
          if (res.rows.length === 0) {
            // qr code not found
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          let checkInUsers = [];
          if (res.rows[0].status.toLowerCase() !== 'vacant') {
            // get list of already checked in users
            checkInUsers = res.rows[0].status.split(',');
          }

          if (checkInUsers.find((uid) => parseInt(uid, 10) === tokenState[1].userId)) {
            // user already checked in
            return response.status(205).send({
              restaurantId: res.rows[0].restaurantid,
              tableId: res.rows[0].tableid
            });
          }

          if (res.rows[0].numseats <= checkInUsers.length) {
            // table is full
            return response.status(409).send({ status: 409, reason: 'Table Full' });
          }

          // add user to checked in user list
          checkInUsers.push(tokenState[1].userId);
          return db.query(
            'UPDATE public.restauranttable SET status = $1::text WHERE tableid = $2::integer;',
            [checkInUsers.join(','), res.rows[0].tableid]
          )
            .then(() => response.status(200).send({
              restaurantId: res.rows[0].restaurantid,
              tableId: res.rows[0].tableid
            }))
            .catch((err) => {
              console.error('Query Error [Restaurant - Update CheckIn Status]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [Restaurant - Get CheckIn Details]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (tokenState[0] === tokenStatus.refresh) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getMenu: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
    || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const tokenState = validateToken(reqBody.token);
    if (tokenState === tokenStatus.valid) {
      // check if restaurant exists
      return db.query(
        'SELECT restaurantname, location, coverimageurl FROM public.restaurant'
        + ' WHERE restaurantid = $1::integer',
        [reqBody.restaurantId]
      )
        // eslint-disable-next-line consistent-return
        .then((res) => {
          if (res.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // get menu
          const menuResponse = {};
          const menuPromises = [];
          menuResponse.name = res.rows[0].restaurantname;
          menuResponse.location = res.rows[0].location;
          menuResponse.image = res.rows[0].coverimageurl;

          menuPromises.push(getReviews(reqBody.restaurantId).then((reviews) => {
            menuResponse.reviews = reviews;
          }));

          menuPromises.push(getRatingPhrases(reqBody.restaurantId).then((rPhrase) => {
            menuResponse.ratingPhrases = rPhrase;
          }));

          menuPromises.push(new Promise((resolve, reject) => {
            menuPromises.push(getMenuCategories(reqBody.restaurantId).then((categoryPromise) => {
              menuResponse.categories = [];
              Promise.all(categoryPromise)
                .then((categoryItem) => {
                  categoryItem.forEach((catItem) => {
                    menuResponse.categories.push(catItem);
                  });
                  resolve();
                })
                .catch((err) => {
                  reject(err);
                });
            }));
          }));

          Promise.all(menuPromises).then(() => response.status(200).send(menuResponse))
            .catch((err) => {
              console.error('Get Menu Promise Error', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [Restaurant - Get Menu Details]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (tokenState === tokenStatus.refresh) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  addOrder: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token') || !Object.prototype.hasOwnProperty.call(reqBody, 'orderInfo')) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    if (validateToken(reqBody.token)) {
      const { orderInfo } = reqBody;
      const customerId = getCustomerId(reqBody.token);
      // Check if orderInfo is valid
      if (!Object.prototype.hasOwnProperty.call(orderInfo, 'restaurantId') || !Object.prototype.hasOwnProperty.call(orderInfo, 'tableId')
      || !Object.prototype.hasOwnProperty.call(orderInfo, 'orderItems')) {
        return response.status(400).send({ status: 400, reason: 'Bad Request' });
      }

      // Check if at least one item has been ordered
      if (orderInfo.orderItems.length < 1) {
        return response.status(400).send({ status: 400, reason: 'Bad Request' });
      }

      // check if restaurant exists
      return db.query(
        'SELECT restaurantname FROM public.restaurant INNER JOIN public.restauranttable ON public.restaurant.restaurantid = public.restauranttable.restaurantid WHERE restaurant.restaurantid = $1::integer AND restauranttable.tableid = $2::integer',
        [orderInfo.restaurantId, orderInfo.tableId]
      )
        // eslint-disable-next-line consistent-return
        .then((res) => {
          if (res.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // time to place order
          // TODO: Remove employee ID hardcoding
          const employeeId = 1;
          const orderStatus = 'in-progress';

          // create order
          db.query(
            'INSERT INTO public.foodorder (customerid, employeeid, orderdatetime, orderstatus, tableid) VALUES ($1::integer, $2::integer, NOW(), $3::text, $4::integer) RETURNING orderid',
            [customerId, employeeId, orderStatus, orderInfo.tableId]
          )
            .then((res) => {
              orderInfo.orderItems.forEach((orderItem) => {
                // add items to order
                db.query(
                  'INSERT INTO public.orderitem (orderid, menuitemid, quantity) VALUES ($1::integer, $2::integer, $3::integer)',
                  [res.rows[0].orderid, orderItem.menuItemId, orderItem.quantity]
                )
                  .then(() => {}).catch((err) => {
                    console.error('Error executing query', err.stack);
                    return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
                  });
              });
            })
            .catch((err) => {
              console.error('Error executing query', err.stack);
              return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
            });

          // Get order history
          const orderResponse = {};
          orderResponse.orderHistory = [];
          const orderHistoryQueries = []; // promise keeper

          db.query('SELECT orderid, orderstatus, orderdatetime, restaurant.restaurantname, restaurant.location FROM public.foodorder INNER JOIN public.restauranttable ON public.foodorder.tableid = public.restauranttable.tableid INNER JOIN public.restaurant ON public.restaurant.restaurantid = public.restauranttable.restaurantid WHERE customerid = $1::integer;', [customerId]).then((res) => {
          // get data
            for (let i = 0; i < res.rows.length; i++) {
              orderResponse.orderHistory[i] = {};
              orderResponse.orderHistory[i].total = 0.0;
              orderResponse.orderHistory[i].orderNumber = res.rows[i].orderid;
              orderResponse.orderHistory[i].restaurant = res.rows[i].restaurantname;
              orderResponse.orderHistory[i].location = res.rows[i].location;
              orderResponse.orderHistory[i].date = res.rows[i].orderdatetime;
              orderResponse.orderHistory[i].orderItems = [];

              const orderid = orderResponse.orderHistory[i].orderNumber;

              const orderQuery = async (index, orderid) => {
                const queryPromise = new Promise((resolve, reject) => {
                  db.query('SELECT menuitemname, price, orderitem.quantity, menuitemimages.imageurl FROM public.menuitem INNER JOIN public.orderitem ON public.orderitem.menuitemid = public.menuitem.menuitemid LEFT JOIN public.menuitemimages ON public.menuitemimages.menuitemid = public.menuitem.menuitemid WHERE orderitem.orderid = $1::integer;', [orderid]).then((res) => {
                  // each item ordered
                    for (let m = 0; m < res.rows.length; m++) {
                      orderResponse.orderHistory[index].orderItems[m] = {};
                      orderResponse.orderHistory[index].orderItems[m].name = res.rows[m].menuitemname;
                      orderResponse.orderHistory[index].orderItems[m].quantity = res.rows[m].quantity;
                      orderResponse.orderHistory[index].orderItems[m].price = res.rows[m].price;
                      orderResponse.orderHistory[index].orderItems[m].image = res.rows[m].imageurl;
                      // update total price
                      orderResponse.orderHistory[index].total += (res.rows[m].price * res.rows[m].quantity);
                    }
                    resolve();
                  }).catch((err) => {
                    reject(err);
                  });
                });

                // wait until the query is complete
                await queryPromise;
              };

              orderHistoryQueries.push(orderQuery(i, orderid));
            }

            Promise.all(orderHistoryQueries)
              .then(() => response.status(200).send(orderResponse))
              .catch((err) => {
                console.error('Error executing query', err.stack);
                return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
              });
          }).catch((err) => {
            console.error('Error executing query', err.stack);
            return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
          });
        }).catch((err) => {
          console.error('Error executing query', err.stack);
          return response.status(400).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  }
};
