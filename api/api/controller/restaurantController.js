const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const paymentEmail = require('../helper/notifications/sendEmail');
const { validateToken, tokenState } = require('../helper/tokenHandler');
const {
  getReviews,
  getRatingPhrasesObj,
  getMenuCategories,
  getOrderHistory,
  getOrderItems
} = require('../helper/objectBuilder');

// TODO: Check that the restaurant id is not a placeholder (id == 0)

module.exports = {
  getRestaurantList: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token);

    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT restaurantid, restaurantname, location, coverimageurl FROM public.restaurant'
        + ' WHERE restaurantid != 0;'
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

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getRestaurantCategories: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token);

    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT categoryid, categoryname, categoryimage FROM public.category'
      )
        .then((res) => {
          const categoryResponse = {};
          categoryResponse.categories = [];
          for (let c = 0; c < res.rows.length; c++) {
            categoryResponse.categories[c] = {};
            categoryResponse.categories[c].categoryId = res.rows[c].categoryid;
            categoryResponse.categories[c].categoryName = res.rows[c].categoryname;
            categoryResponse.categories[c].categoryImage = res.rows[c].categoryimage;
          }

          // return categories
          return response.status(200).send(categoryResponse);
        }).catch((err) => {
          console.error('Query Error [Restaurant - Get Restaurant Category List]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getRatingPhrases: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token);

    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT phraseid, phrasedescription, type, positive FROM public.ratingphrase'
      )
        .then((res) => {
          const phraseResponse = {};
          phraseResponse.phrases = [];
          for (let p = 0; p < res.rows.length; p++) {
            phraseResponse.phrases[p] = {};
            phraseResponse.phrases[p].phraseId = res.rows[p].phraseid;
            phraseResponse.phrases[p].phraseDescription = res.rows[p].phrasedescription;
            phraseResponse.phrases[p].phraseType = res.rows[p].type;
            phraseResponse.phrases[p].phrasePositive = res.rows[p].positive;
          }

          // return phrases
          return response.status(200).send(phraseResponse);
        }).catch((err) => {
          console.error('Query Error [Restaurant - Get Rating Phrases List]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
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
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT tableid, tablenumber, restaurantid, numseats FROM public.restauranttable'
        + ' WHERE qrcode = $1::text;',
        [reqBody.qrcode]
      )
        .then((res) => {
          if (res.rows.length === 0) {
            // qr code not found
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check if user already checked in
          return db.query(
            'SELECT checkedin FROM public.person'
            + ' WHERE userid = $1::integer;',
            [userToken.data.userId]
          )
            .then((cRes) => {
              if (cRes.rows[0].checkedin == null) {
                // check in user
                return db.query(
                  'UPDATE public.person SET checkedin = $1::text WHERE userid = $2::integer;',
                  [reqBody.qrcode, userToken.data.userId]
                )
                  .then(() => response.status(200).send({
                    restaurantId: res.rows[0].restaurantid,
                    tableId: res.rows[0].tableid,
                    tableNumber: res.rows[0].tablenumber
                  }))
                  .catch((err) => {
                    console.error('Query Error [Restaurant - Update User CheckIn Status]', err.stack);
                    return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
                  });
              }

              // user already checked in
              return db.query(
                'SELECT tableid, tablenumber, restaurantid, numseats FROM public.restauranttable'
                + ' WHERE qrcode = $1::text;',
                [cRes.rows[0].checkedin]
              )
                .then((checkedInRes) => response.status(205).send({
                  restaurantId: checkedInRes.rows[0].restaurantid,
                  tableId: checkedInRes.rows[0].tableid,
                  tableNumber: checkedInRes.rows[0].tablenumber
                }))
                .catch((err) => {
                  console.error('Query Error [Restaurant - Get Already CheckIn Details]', err.stack);
                  return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
                });
            })
            .catch((err) => {
              console.error('Query Error [Restaurant - Check User CheckIn Status]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [Restaurant - Get CheckIn Details]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getMenu: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    const maxBodyKeys = Object.prototype.hasOwnProperty.call(reqBody, 'disableFields') ? 4 : 3;
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || Object.keys(reqBody).length !== maxBodyKeys) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token);
    if (userToken.state === tokenState.VALID) {
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

          // allow option to disable multiple fields usefull to decrease request size
          let disableFields = false;
          if (Object.prototype.hasOwnProperty.call(reqBody, 'disableFields')) {
            disableFields = true;
          }

          if (disableFields && reqBody.disableFields.includes('image')) {
            menuResponse.image = 'disabled';
          } else {
            menuResponse.image = res.rows[0].coverimageurl;
          }

          menuPromises.push(getReviews(reqBody.restaurantId).then((reviews) => {
            if (disableFields && reqBody.disableFields.includes('reviews')) {
              menuResponse.reviews = 'disabled';
            } else {
              menuResponse.reviews = reviews;
            }
          }));

          menuPromises.push(getRatingPhrasesObj(reqBody.restaurantId).then((rPhrase) => {
            if (disableFields && reqBody.disableFields.includes('ratingPhrases')) {
              menuResponse.ratingPhrases = 'disabled';
            } else {
              menuResponse.ratingPhrases = rPhrase;
            }
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

    if (userToken.state === tokenState.REFRESH) {
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
    const userToken = validateToken(reqBody.token, true);
    // TODO: Check if refresh token is valid for extra security
    if (userToken.state === tokenState.VALID) {
      const { orderInfo } = reqBody;
      const customerId = userToken.data.userId;

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
          const orderStatus = 'Received';
          const initialProgress = 0;

          // create order
          // TODO: Work of order completion time
          db.query(
            'INSERT INTO public.customerorder (customerid, employeeid, tableid, ordernumber, orderdatetime,'
            + ' ordercompletiontime, orderstatus, progress, waitertip, ordertotal)'
            + ' VALUES ($1::integer,$2::integer,$3::integer,\'0\',NOW(),NOW(),$4::text,$5::integer,$6::real,$7::real)'
            + ' RETURNING orderid',
            [
              customerId,
              orderInfo.employeeId,
              orderInfo.tableId,
              orderStatus,
              initialProgress,
              orderInfo.waiterTip,
              orderInfo.orderTotal
            ]
          )
            .then((resOrderId) => {
              // Order number format: userId-restauramtId-orderid (without dashes)
              const orderNum = `${userToken.data.userId}${orderInfo.restaurantId}${resOrderId.rows[0].orderid}`;

              // Update order number
              Promise.resolve(db.query(
                'UPDATE public.customerorder SET ordernumber = $1::text WHERE orderid = $2::integer',
                [orderNum, resOrderId.rows[0].orderid]
              ))
                .then(() => { })
                .catch((err) => {
                  console.error('Query Error [Add Order - Update Order Number]', err.stack);
                  return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
                });

              orderInfo.orderItems.forEach((orderItem) => {
                // add items to order
                db.query(
                  'INSERT INTO public.itemordered (orderid, menuitemid, quantity, orderselections, progress)'
                  + ' VALUES ($1::integer, $2::integer, $3::integer, $4::json,  $5::integer)',
                  [
                    resOrderId.rows[0].orderid,
                    orderItem.menuItemId,
                    orderItem.quantity,
                    // eslint-disable-next-line max-len
                    Object.keys(orderItem.orderSelections).length === 0 ? null : orderItem.orderSelections,
                    initialProgress
                  ]
                )
                  .then(() => { })
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

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  listOrders: async (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'getAllOrders')
      || Object.keys(reqBody).length !== 4) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT restaurantname FROM public.restaurant WHERE restaurant.restaurantid = $1::integer',
        [reqBody.restaurantId]
      )
        .then((resCheck) => {
          if (resCheck.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          let oQuery = 'SELECT customerorder.orderid, customerorder.orderstatus,'
            + ' restauranttable.tableid, restauranttable.tablenumber,'
            + ' person.userid AS "employeeid", restaurantemployee.employeenumber,'
            + ' person.name AS "ename", person.surname AS "esurname",'
            + ' customerorder.orderdatetime, customerorder.ordercompletiontime'
            + ' FROM public.customerorder'
            + ' INNER JOIN public.restauranttable ON customerorder.tableid = restauranttable.tableid'
            + ' INNER JOIN public.person ON customerorder.employeeid = person.userid'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.userid = person.userid'
            + ' WHERE restauranttable.restaurantid = $1::integer';

          // check if past orders should be included
          if (reqBody.getAllOrders === false) {
            oQuery += " AND NOT (LOWER(orderstatus) = 'paid' OR LOWER(orderstatus) = 'rated')";
          }

          return db.query(oQuery, [reqBody.restaurantId])
            .then(async (res) => {
              const orderResponse = {};
              orderResponse.orders = [];
              await Promise.all(res.rows.map(async (orderItem) => {
                const orderDetails = {};
                orderDetails.orderId = orderItem.orderid;
                orderDetails.orderStatus = orderItem.orderstatus;
                orderDetails.orderDateTime = orderItem.orderdatetime;
                orderDetails.orderCompletionTime = orderItem.ordercompletiontime;
                orderDetails.tableId = orderItem.tableid;
                orderDetails.tableNumber = orderItem.tablenumber;
                orderDetails.employeeId = orderItem.employeeid;
                orderDetails.employeeNumber = orderItem.employeenumber;
                orderDetails.employeeName = orderItem.ename;
                orderDetails.employeeSurname = orderItem.esurname;
                orderDetails.orderDetails = await getOrderItems(orderItem.orderid);
                orderResponse.orders.push(orderDetails);
              }));
              return response.status(200).send(orderResponse);
            })
            .catch((err) => {
              console.error('Query Error [List Orders - Get Orders]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [List Orders - Check Restaurant Existence]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  updateOrderStatus: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'orderId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'percentage')
      || Object.keys(reqBody).length !== 4) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT orderstatus FROM public.customerorder WHERE orderid = $1::integer;',
        [reqBody.orderId]
      )
        .then((resCheck) => {
          if (resCheck.rows.length === 0) {
            // order does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check if the order has been paid for
          if (resCheck.rows[0].orderstatus.toLowerCase() === 'paid') {
            return response.status(205).send({ status: 205, reason: 'Order Already Paid' });
          }

          return db.query(
            'UPDATE public.customerorder SET orderstatus = $1::text'
            + ' WHERE orderid = $2::integer;',
            [reqBody.percentage, reqBody.orderId]
          )
            .then(() => response.status(200).send())
            .catch((err) => {
              console.error('Query Error [Update Order Status - Update Order Status]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [Update Order Status - Check Order Existence]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getOrderStatus: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'orderId')
      || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT orderstatus, progress FROM public.customerorder WHERE orderid = $1::integer;',
        [reqBody.orderId]
      )
        .then((res) => {
          if (res.rows.length === 0) {
            // order does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // return order status
          return response.status(200).send({
            orderStatus: res.rows[0].orderstatus,
            orderProgress: res.rows[0].progress
          });
        })
        .catch((err) => {
          console.error('Query Error [Update Order Status - Check Order Existence]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  createRestaurant: (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'name')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'description')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'location')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'coverImageURL')
      || Object.keys(reqBody).length !== 6) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      // check admin status
      // TODO: check more admin information [security]
      // TODO: allow user to be an admin for more than one restaurant
      if (userToken.data.isAdmin) {
        return db.query(
          'INSERT INTO public.restaurant (restaurantName, restaurantDescription, location, coverimageurl)'
          + ' VALUES ($1::text, $2::text, $3::text, $4::text)'
          + ' RETURNING restaurantid',
          [
            reqBody.name,
            reqBody.description,
            reqBody.location,
            reqBody.coverImageURL
          ]
        )
          .then((res) => db.query(
            'UPDATE public.adminuser SET restaurantid = $1::integer'
            + ' WHERE userid = $2::integer;',
            [res.rows[0].restaurantid, userToken.data.userId]
          )
            .then(() => response.status(201).send({ restaurantId: res.rows[0].restaurantid }))
            .catch((err) => {
              console.error('Query Error [Restaurant - Update Restaurant Admin]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            }))
          .catch((err) => {
            console.error('Query Error [Restaurant - Create Restaurant]', err.stack);
            return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
          });
      }
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  createTable: (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'tableNumber')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'seatCount')
      || Object.keys(reqBody).length !== 5
      || Number.isNaN(reqBody.seatCount)
      || reqBody.seatCount < 1) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT restaurantname FROM public.restaurant WHERE restaurant.restaurantid = $1::integer',
        [reqBody.restaurantId]
      )
        .then((resCheck) => {
          if (resCheck.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          const newTableStatus = 'Vacant';
          // UUID version 4 with dashes removes
          const qrcode = uuidv4().replace(/-/g, '');
          return db.query(
            'INSERT INTO public.restauranttable'
            + ' (restaurantid, numseats, tablenumber, status, qrcode)'
            + ' VALUES ($1::integer, $2::integer, $3::text, $4::text, $5::text)'
            + ' RETURNING tableid;',
            [
              reqBody.restaurantId,
              parseInt(reqBody.seatCount, 10),
              reqBody.tableNumber,
              newTableStatus,
              qrcode
            ]
          )
            .then((res) => response.status(201).send({ tableId: res.rows[0].tableid, qrcode }))
            .catch((err) => {
              console.error('Query Error [Restaurant - Create Restaurant Table]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [Create Table - Check Restaurant Existence]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getTableQRCode: (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'tableId')
      || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT qrcode FROM public.restauranttable WHERE tableid = $1::integer',
        [reqBody.tableId]
      )
        .then((res) => {
          if (res.rows.length === 0) {
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          return response.status(200).send({ qrcode: res.rows[0].qrcode });
        })
        .catch((err) => {
          console.error('Query Error [Restaurant - Get Table QR code]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getTableStatus: async (reqBody, response) => {
    // restaurant and table ids can not be used simultaneously
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      // eslint-disable-next-line no-mixed-operators
      && (!Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'tableId'))
      // eslint-disable-next-line no-mixed-operators
      || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Requesst' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      let allTablesStatus = false;
      if (Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')) {
        allTablesStatus = true;
      }

      // check if restaurant or table exists
      let ecQuery = 'SELECT tableid FROM public.restauranttable';
      let queryID = null;
      if (allTablesStatus) {
        ecQuery += ' WHERE restaurantid = $1::integer';
        queryID = reqBody.restaurantId;
      } else {
        ecQuery += ' WHERE tableid = $1::integer';
        queryID = reqBody.tableId;
      }

      return db.query(ecQuery, [queryID])
        .then((resCheck) => {
          if (resCheck.rows.length === 0) {
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          let sQuery = 'SELECT tableid, tablenumber, numseats, status, qrcode';
          sQuery += ' FROM public.restauranttable';
          if (allTablesStatus) {
            sQuery += ' WHERE restaurantid = $1::integer;';
          } else {
            sQuery += ' WHERE tableid = $1::integer;';
          }

          return db.query(sQuery, [queryID])
            .then((tables) => {
              const tableStatusResponse = {};
              tableStatusResponse.result = [];
              tables.rows.forEach((table) => {
                const singleTableStatus = {};
                singleTableStatus.tableId = table.tableid;
                singleTableStatus.tableNumber = table.tablenumber;
                singleTableStatus.numSeats = table.numseats;
                if (table.status.toLowerCase() !== 'vacant') {
                  const custCount = table.status.split(',').length;
                  singleTableStatus.status = `${custCount} Customer${custCount === 1 ? '' : 's'}`;
                } else {
                  singleTableStatus.status = table.status;
                }

                singleTableStatus.qrcode = table.qrcode;
                tableStatusResponse.result.push(singleTableStatus);
              });
              return response.status(200).send(tableStatusResponse);
            })
            .catch((err) => {
              console.error('Query Error [Table Staus - Get All Tables Statuses]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [Table Status  - Check Restaurant/Table Exists]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
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
      || !Object.prototype.hasOwnProperty.call(reqBody, 'name')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'email')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'waiterTip')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'orderTotal')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'orderTax')
      || Object.keys(reqBody).length !== 10
      || reqBody.amountPaid < 0.0) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    // TODO: Check if refresh token is valid for extra security
    if (userToken.state === tokenState.VALID) {
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

          if (resOrderStatus.rows[0].orderstatus.toLowerCase() === 'paid'
          || resOrderStatus.rows[0].orderstatus.toLowerCase() === 'rated') {
            // order has already been paid for (and rated)
            return response.status(205).send();
          }

          // for payment email data
          const newUserData = {};
          newUserData.orderId = reqBody.orderId;
          newUserData.name = reqBody.name;
          newUserData.email = reqBody.email;
          newUserData.amountPaid = reqBody.amountPaid; // under items ordered
          newUserData.orderName = reqBody.orderName;
          newUserData.paymentMethod = reqBody.paymentMethod;
          newUserData.waiterTip = reqBody.waiterTip;
          newUserData.orderTax = reqBody.orderTax;
          newUserData.orderTotal = reqBody.orderTotal;
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
              .then(() => {
                paymentEmail.paymentEmail(newUserData); // send payment email
                return response.status(200).send();
              })
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

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  addReview: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'type')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'itemId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'orderId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'ratingScore')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'comment')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'public')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'phrases')
      || Object.keys(reqBody).length !== 9) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // check access token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      // check if items exists
      let query = '';
      switch (reqBody.type.toLowerCase()) {
        case 'menuitem':
          query = 'SELECT menuitemid FROM public.menuitem WHERE menuitemid = $1::integer;';
          break;
        case 'restaurant':
          query = 'SELECT restaurantid FROM public.restaurant WHERE restaurantid = $1::integer;';
          break;
        case 'waiter': // consider using 'employee'
          query = 'SELECT userid FROM public.person WHERE userid = $1::integer;';
          break;
        default:
          // request error
          return response.status(400).send({ status: 400, reason: 'Bad Request' });
      }

      return db.query(query, [reqBody.itemId])
        .then((res) => {
          if (res.rows.length === 0) {
            // menu item, restaurant or employee not found
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check if order exists
          return db.query(
            'SELECT orderid, customerid, orderstatus FROM public.customerorder'
            + ' WHERE orderid = $1::integer AND customerid = $2::integer',
            [reqBody.orderId, userToken.data.userId]
          )
            .then((oRes) => {
              if (oRes.rows.length === 0) {
                return response.status(404).send({ status: 404, reason: 'Not Found' });
              }

              const orderStatus = oRes.rows[0].orderstatus.toLowerCase();

              if (orderStatus === 'rated') {
                return response.status(409).send({ status: 409, reason: 'Order Already Rated' });
              // eslint-disable-next-line no-else-return
              } else if (orderStatus === 'received') {
                return response.status(402).send({ status: 402, reason: 'Payment Required' });
              }

              // rate order
              let rQuery = 'INSERT INTO public.review';
              rQuery += ' (orderid, reviewdatetime, ratingscore, comment, public, ';
              switch (reqBody.type.toLowerCase()) {
                case 'restaurant':
                  rQuery += 'restaurantid';
                  break;
                case 'waiter': // consider using 'employee'
                  rQuery += 'employeeid';
                  break;
                default:
                  rQuery += 'menuitemid';
                  break;
              }

              rQuery += ') VALUES ';
              rQuery += '($1::integer, NOW(), $2::real, $3::text, $4::boolean, $5::integer)';
              rQuery += ' RETURNING reviewid;';
              return db.query(rQuery, [
                reqBody.orderId,
                reqBody.ratingScore,
                reqBody.comment === '' ? null : reqBody.comment,
                reqBody.public,
                reqBody.itemId
              ])
                .then((rRes) => {
                  // add phrases
                  reqBody.phrases.forEach((rPhrase) => {
                    Promise.resolve(db.query(
                      'INSERT INTO public.customerphraserating (reviewid, phraseid, ratingscore)'
                      + ' VALUES ($1::integer, $2::integer, $3::real);',
                      [rRes.rows[0].reviewid, rPhrase.phraseId, rPhrase.phraseScore]
                    ));
                  });

                  // Update order status
                  return db.query(
                    'UPDATE public.customerorder SET orderstatus = $1::text WHERE orderid = $2::integer',
                    ['Rated', reqBody.orderId]
                  )
                    .then(() => response.status(201).send({ status: 201, reason: 'Reivew Recorded' }))
                    .catch((err) => {
                      console.error('Query Error [Order Review - Update Order Status]', err.stack);
                      return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
                    });
                })
                .catch((err) => {
                  console.error('Query Error [Order Review - Add User Review]', err.stack);
                  return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
                });
            })
            .catch((err) => {
              console.error('Query Error [Order Review - Check Order Existence]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [Order Review - Check Item Existence]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  }
};
