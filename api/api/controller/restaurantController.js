const db = require('../db');
const { validateToken, tokenStatus } = require('../helper/tokenHandler');
const {
  getReviews,
  getRatingPhrases,
  getMenuCategories,
  getOrderHistory
} = require('../helper/objectBuilder');

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
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'orderInfo')
    || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const tokenState = validateToken(reqBody.token, true);
    // TODO: Check if refresh token is valid for extra security
    if (tokenState[0] === tokenStatus.valid) {
      const { orderInfo } = reqBody;
      const customerId = tokenState[1].userId;

      // Check if orderInfo is valid
      if (!Object.prototype.hasOwnProperty.call(orderInfo, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(orderInfo, 'tableId')
      || !Object.prototype.hasOwnProperty.call(orderInfo, 'orderItems')) {
        return response.status(400).send({ status: 400, reason: 'Bad Request' });
      }

      // Check if at least one item has been ordered
      if (orderInfo.orderItems.length < 1) {
        return response.status(400).send({ status: 400, reason: 'Bad Request' });
      }

      // TODO: Get restaurant and table information from check in records
      // check if restaurant exists
      return db.query(
        'SELECT restaurantname FROM public.restaurant'
        + ' INNER JOIN public.restauranttable ON restaurant.restaurantid = restauranttable.restaurantid'
        + ' WHERE restaurant.restaurantid = $1::integer AND restauranttable.tableid = $2::integer',
        [orderInfo.restaurantId, orderInfo.tableId]
      )
        // eslint-disable-next-line consistent-return
        .then((res) => {
          if (res.rows.length === 0) {
            // restaurant and/or table does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // time to place order
          const orderStatus = 'in-progress';

          // create order
          // TODO: Work of order completion time
          db.query(
            'INSERT INTO public.customerorder (customerid, employeeid, tableid, orderdatetime,'
            + ' ordercompletiontime, orderstatus)'
            + ' VALUES ($1::integer, $2::integer, $3::integer, NOW(), NOW(), $4::text)'
            + ' RETURNING orderid',
            [customerId, orderInfo.employeeId, orderInfo.tableId, orderStatus]
          )
            .then((resOrderId) => {
              orderInfo.orderItems.forEach((orderItem) => {
                // add items to order
                db.query(
                  'INSERT INTO public.itemordered (orderid, menuitemid, quantity, orderselections)'
                  + ' VALUES ($1::integer, $2::integer, $3::integer, $4::json)',
                  [
                    resOrderId.rows[0].orderid,
                    orderItem.menuItemId,
                    orderItem.quantity,
                    // eslint-disable-next-line max-len
                    Object.keys(orderItem.orderSelections).length === 0 ? null : orderItem.orderSelections
                  ]
                )
                  .then(() => {})
                  .catch((err) => {
                    console.error('Query Error [Add Order - Add Order Items]', err.stack);
                    return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
                  });
              });
            })
            .catch((err) => {
              console.error('Query Error [Add Order - Create Customer Order]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });

          // Get order history
          const orderResponse = {};
          const orderPromises = [];

          orderPromises.push(new Promise((resolve, reject) => {
            orderPromises.push(getOrderHistory(customerId).then((orderHistoryPromise) => {
              orderResponse.orderHistory = [];
              Promise.all(orderHistoryPromise)
                .then((orderHistoryItem) => {
                  orderHistoryItem.forEach((ordHistItem) => {
                    orderResponse.orderHistory.push(ordHistItem);
                  });
                  resolve();
                })
                .catch((err) => {
                  reject(err);
                });
            }));
          }));

          Promise.all(orderPromises).then(() => response.status(201).send(orderResponse))
            .catch((err) => {
              console.error('Add Order Promise Error', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        }).catch((err) => {
          console.error('Query Error [Add Order - Check Restaurant Existence]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (tokenState[0] === tokenStatus.refresh) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  orderPayment: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'orderId')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'paymentMethod')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'amountPaid')
    || Object.keys(reqBody).length !== 5
    || reqBody.amountPaid < 0.0) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const tokenState = validateToken(reqBody.token, true);
    // TODO: Check if refresh token is valid for extra security
    if (tokenState[0] === tokenStatus.valid) {
      // check if order exists
      return db.query(
        'SELECT orderstatus FROM public.customerorder'
        + ' WHERE orderid = $1::integer;',
        [reqBody.orderId]
      )
        .then((resOrderStatus) => {
          if (resOrderStatus.rows.length === 0) {
            // order does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          if (resOrderStatus.rows[0].orderstatus.toLowerCase() === 'paid') {
            // order has already been paid for
            return response.status(205).send();
          }

          // pay for order
          const newOrderStatus = 'Paid';

          return db.query(
            'INSERT INTO public.payment (orderid, paymentmethod, paymentamount, paymentdatetime)'
            + ' VALUES ($1::integer, $2::text, $3::real, NOW());',
            [reqBody.orderId, reqBody.paymentMethod, reqBody.amountPaid]
          )
            .then(() => db.query(
              'UPDATE public.customerorder SET orderstatus = $1::text WHERE orderid = $2::integer',
              [newOrderStatus, reqBody.orderId]
            )
              .then(() => response.status(200).send())
              .catch((err) => {
                console.error('Query Error [Order Payment - Update Order Status]', err.stack);
                return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
              }))
            .catch((err) => {
              console.error('Query Error [Order Payment - Create New Payment]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [Order Payment - Check Order Existence]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (tokenState[0] === tokenStatus.refresh) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  }
};
