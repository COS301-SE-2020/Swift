/* eslint-disable linebreak-style */
/* eslint-disable no-console */
const axios = require('axios');
const db = require('../db').poolr;
const dbw = require('../db').poolw;
const paymentEmail = require('../helper/notifications/sendEmail');
const { mlApiURL } = require('../config/config-ml-api.json');
const { validateToken, tokenState } = require('../helper/tokenHandler');
const {
  getReviews,
  getRatingPhrasesObj,
  getMenuCategories,
  getOrderHistory,
  getActivePromotions,
  getOrderItems
} = require('../helper/objectBuilder');

module.exports = {
  getRestaurantList: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          const res = await client.query(
            'SELECT restaurantid,restaurantname,location,branch,coverimageurl FROM public.restaurant ORDER BY restaurantid ASC'
          );

          const restaurantResponse = {};
          restaurantResponse.restaurants = [];
          for (let r = 0; r < res.rows.length; r++) {
            restaurantResponse.restaurants[r] = {};
            restaurantResponse.restaurants[r].restaurantId = res.rows[r].restaurantid;
            restaurantResponse.restaurants[r].name = res.rows[r].restaurantname;
            restaurantResponse.restaurants[r].location = res.rows[r].location;
            restaurantResponse.restaurants[r].branch = res.rows[r].branch;
            restaurantResponse.restaurants[r].image = res.rows[r].coverimageurl;
            restaurantResponse.restaurants[r].categories = [];
            restaurantResponse.restaurants[r].phrases = [];
            // eslint-disable-next-line no-await-in-loop
            const resCat = await client.query(
              'SELECT categoryid FROM public.restaurantcategory'
              + ' WHERE restaurantid = $1::integer',
              [res.rows[r].restaurantid]
            );

            resCat.rows.forEach((categoryId) => {
              restaurantResponse.restaurants[r].categories.push(categoryId.categoryid);
            });

            const ratingPhraseFetchLimit = 2;
            // eslint-disable-next-line no-await-in-loop
            const ratePhraseQ = await client.query(
              'SELECT ratingphrase.phrasedescription, AVG(customerphraserating.ratingscore) as "avgScore" '
              + ' FROM public.customerphraserating'
              + ' INNER JOIN public.ratingphrase ON customerphraserating.phraseid = ratingphrase.phraseid '
              + ' INNER JOIN public.review ON customerphraserating.reviewid = review.reviewid '
              + " WHERE LOWER(ratingphrase.type) = 'restaurant' AND review.restaurantId = $1::integer "
              + ' GROUP BY ratingphrase.phrasedescription '
              + ' ORDER BY "avgScore" DESC LIMIT $2::integer',
              [res.rows[r].restaurantid, ratingPhraseFetchLimit]
            );

            ratePhraseQ.rows.forEach((ratePhrase) => {
              restaurantResponse.restaurants[r].phrases.push(ratePhrase.phrasedescription);
            });

            // eslint-disable-next-line no-await-in-loop
            const ratingRes = await client.query(
              'SELECT AVG(ratingscore) AS "rating" FROM public.review'
              + ' WHERE restaurantid = $1::integer AND ratingscore IS NOT NULL;',
              [res.rows[r].restaurantid]
            );

            if (ratingRes.rows[0].rating != null) {
              restaurantResponse.restaurants[r].rating = ratingRes.rows[0].rating;
            } else {
              // no rating available
              restaurantResponse.restaurants[r].rating = 0.0;
            }
          }

          await client.query('COMMIT');
          return response.status(200).send(restaurantResponse);
        } catch (err) {
          // rollback any changes
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
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
        'SELECT categoryid, categoryname, categoryimage, categoryicon FROM public.category'
      )
        .then((res) => {
          const categoryResponse = {};
          categoryResponse.categories = [];
          for (let c = 0; c < res.rows.length; c++) {
            categoryResponse.categories[c] = {};
            categoryResponse.categories[c].categoryId = res.rows[c].categoryid;
            categoryResponse.categories[c].categoryName = res.rows[c].categoryname;
            categoryResponse.categories[c].categoryImage = res.rows[c].categoryimage;
            categoryResponse.categories[c].categoryicon = res.rows[c].categoryicon;
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
                return dbw.query(
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
  checkOut: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token validity
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return dbw.query(
        'UPDATE public.person SET checkedin = $1::text WHERE userid = $2::integer;',
        [null, userToken.data.userId]
      )
        .then(() => response.status(200).send({ status: 200, reason: 'Checked Out' }))
        .catch((err) => {
          console.error('Query Error [Restaurant - Checkout User]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  callWaiter: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if user checked in exists
          const cRes = await client.query(
            'SELECT restauranttable.restaurantid,restauranttable.tableid,restauranttable.tablenumber'
            + ' FROM public.person'
            + ' INNER JOIN public.restauranttable ON person.checkedin = restauranttable.qrcode'
            + ' WHERE person.userid = $1::integer',
            [userToken.data.userId]
          );

          if (cRes.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // ------------------------------------ //
          // ------------------------------------ //
          // TODO: Send notification
          // restaurant id = cRes.rows[0].restaurantid
          // table id = cRes.rows[0].tableid
          // table number = cRes.rows[0].tablenumber
          // ------------------------------------ //
          // ------------------------------------ //

          // commit changes and end transaction
          await client.query('COMMIT');

          // send response
          return response.status(200).send();
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Add Menu Category]', err.stack);
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
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      // eslint-disable-next-line no-console
      // console.log(userToken);

      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if restaurant exists
          const res = await client.query(
            'SELECT restaurantname, location, coverimageurl FROM public.restaurant'
            + ' WHERE restaurantid = $1::integer',
            [reqBody.restaurantId]
          );

          if (res.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // get menu
          const menuResponse = {};
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

          // get reviews
          if (disableFields && reqBody.disableFields.includes('reviews')) {
            menuResponse.reviews = 'disabled';
          } else {
            menuResponse.reviews = await getReviews(reqBody.restaurantId);
          }

          // get rating phrases
          if (disableFields && reqBody.disableFields.includes('ratingPhrases')) {
            menuResponse.ratingPhrases = 'disabled';
          } else {
            menuResponse.ratingPhrases = await getRatingPhrasesObj(reqBody.restaurantId);
          }

          // get menu categories
          menuResponse.categories = await getMenuCategories(reqBody.restaurantId);

          // commit changes
          client.query('COMMIT');

          // send response
          return response.status(200).send(menuResponse);
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
    if (userToken.state === tokenState.VALID) {
      const { orderInfo } = reqBody;
      const customerId = userToken.data.userId;

      // TODO: Add checks for waiter tip and employee id in order info object
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
      // check if a user is checked in to that table

      // eslint-disable-next-line consistent-return
      return (async () => {
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if restaurant exists
          const res = await client.query(
            'SELECT restaurantname FROM public.restaurant'
            + ' INNER JOIN public.restauranttable ON restaurant.restaurantid = restauranttable.restaurantid'
            + ' WHERE restaurant.restaurantid = $1::integer AND restauranttable.tableid = $2::integer',
            [orderInfo.restaurantId, orderInfo.tableId]
          );

          if (res.rows.length === 0) {
            // restaurant and/or table does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // time to place order
          const orderStatus = 'Received';
          const initialProgress = 0;

          // create order
          // TODO: Work out order completion time from estimated time
          const resOrderId = await client.query(
            'INSERT INTO public.customerorder (customerid, employeeid, tableid, ordernumber, orderdatetime,'
            + ' ordercompletiontime, orderstatus, progress, waitertip)'
            + ' VALUES ($1::integer,$2::integer,$3::integer,\'0\',NOW(),NOW(),$4::text,$5::integer,$6::real)'
            + ' RETURNING orderid',
            [
              customerId,
              orderInfo.employeeId,
              orderInfo.tableId,
              orderStatus,
              initialProgress,
              orderInfo.waiterTip
            ]
          );

          // Order number format: userId-restauramtId-orderid (without dashes)
          const orderNum = `${userToken.data.userId}${orderInfo.restaurantId}${resOrderId.rows[0].orderid}`;

          // Update order number
          await client.query(
            'UPDATE public.customerorder SET ordernumber = $1::text WHERE orderid = $2::integer',
            [orderNum, resOrderId.rows[0].orderid]
          );

          let orderTotal = 0.0;
          for (let oi = 0; oi < orderInfo.orderItems.length; oi++) {
            // add items to order
            // eslint-disable-next-line no-await-in-loop
            await client.query(
              'INSERT INTO public.itemordered (orderid, menuitemid, quantity, orderselections, progress, itemtotal)'
              + ' VALUES ($1::integer, $2::integer, $3::integer, $4::json, $5::integer, $6::real)',
              [
                resOrderId.rows[0].orderid,
                orderInfo.orderItems[oi].menuItemId,
                orderInfo.orderItems[oi].quantity,
                // eslint-disable-next-line max-len
                Object.keys(orderInfo.orderItems[oi].orderSelections).length === 0
                  ? null : orderInfo.orderItems[oi].orderSelections,
                initialProgress,
                orderInfo.orderItems[oi].itemTotal
              ]
            );

            orderTotal += parseFloat(orderInfo.orderItems[oi].itemTotal);
          }

          // update order total
          await client.query(
            'UPDATE public.customerorder SET ordertotal = $1::real WHERE orderid = $2::integer',
            [orderTotal, resOrderId.rows[0].orderid]
          );

          // commit changes
          await client.query('COMMIT');

          // Get order history
          const orderResponse = {};
          const orderHistoryPromise = await getOrderHistory(customerId);

          orderResponse.orderHistory = [];
          Promise.all(orderHistoryPromise)
            .then((orderHistoryItem) => {
              orderHistoryItem.forEach((ordHistItem) => {
                orderResponse.orderHistory.push(ordHistItem);
              });

              // refresh ML API cache
              axios.post(mlApiURL,
                {
                  requestType: 'clearOrdersCache',
                  token: reqBody.token
                }).catch((err) => {
                console.error('ML API Orders Cache Reset -', err.stack);
              });

              // send response
              return response.status(201).send(orderResponse);
            })
            .catch((err) => {
              console.error('Add Order Promise Error', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
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
          console.error('Query Error [Add Order]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  listOrders: (reqBody, response) => {
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
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if restaurant exits
          const resCheck = await client.query(
            'SELECT restaurantname FROM public.restaurant WHERE restaurant.restaurantid = $1::integer',
            [reqBody.restaurantId]
          );

          if (resCheck.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // get orders
          let oQuery = 'SELECT customerorder.orderid, customerorder.orderstatus,'
            + ' restauranttable.tableid, restauranttable.tablenumber,'
            + ' person.userid AS "employeeid", restaurantemployee.employeenumber,'
            + ' person.name AS "ename", person.surname AS "esurname",'
            + ' customerorder.orderdatetime, customerorder.ordercompletiontime, customerorder.ordertotal,'
            + ' customerorder.progress FROM public.customerorder'
            + ' INNER JOIN public.restauranttable ON customerorder.tableid = restauranttable.tableid'
            + ' INNER JOIN public.person ON customerorder.employeeid = person.userid'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.userid = person.userid'
            + ' WHERE restauranttable.restaurantid = $1::integer';

          // check if past orders should be included
          if (reqBody.getAllOrders === false) {
            oQuery += " AND NOT (LOWER(orderstatus) = 'paid' OR LOWER(orderstatus) = 'rated')";
          }

          // get order details
          const res = await client.query(oQuery, [reqBody.restaurantId]);
          const orderResponse = {};
          orderResponse.orders = [];
          for (let ord = 0; ord < res.rows.length; ord++) {
            const orderDetails = {};
            orderDetails.orderId = res.rows[ord].orderid;
            orderDetails.orderStatus = res.rows[ord].orderstatus;
            orderDetails.orderDateTime = res.rows[ord].orderdatetime;
            orderDetails.orderCompletionTime = res.rows[ord].ordercompletiontime;
            orderDetails.orderTotal = res.rows[ord].ordertotal;
            orderDetails.orderProgress = res.rows[ord].progress;
            orderDetails.tableId = res.rows[ord].tableid;
            orderDetails.tableNumber = res.rows[ord].tablenumber;
            orderDetails.employeeId = res.rows[ord].employeeid;
            orderDetails.employeeNumber = res.rows[ord].employeenumber;
            orderDetails.employeeName = res.rows[ord].ename;
            orderDetails.employeeSurname = res.rows[ord].esurname;
            // eslint-disable-next-line no-await-in-loop
            orderDetails.orderDetails = await getOrderItems(res.rows[ord].orderid);
            orderResponse.orders.push(orderDetails);
          }

          // commit and return response
          await client.query('COMMIT');
          return response.status(200).send(orderResponse);
        } catch (err) {
          // roll back changes
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [List Orders - Get Orders]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  updateOrder: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'orderId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'orderItems')
      || Object.keys(reqBody).length !== 4) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }
    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      const customerId = userToken.data.userId;

      // Check if at least one item has been ordered
      if (reqBody.orderItems.length < 1) {
        return response.status(400).send({ status: 400, reason: 'Bad Request' });
      }

      // eslint-disable-next-line consistent-return
      return (async () => {
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if order exists
          const res = await client.query(
            'SELECT customerorder.orderstatus, customerorder.orderid, customerorder.progress,'
            + ' customerorder.ordertotal, person.userid FROM public.customerorder'
            + ' INNER JOIN public.restauranttable ON customerorder.tableid = restauranttable.tableid'
            + ' INNER JOIN public.person ON person.userid = customerorder.customerid'
            + ' WHERE customerorder.orderid = $1::integer AND person.userid = $2::integer',
            [reqBody.orderId, userToken.data.userId]
          );
          if (res.rows.length === 0) {
            // restaurant and/or table does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // time to place order
          const orderStatus = res.rows[0].orderstatus.toLowerCase();
          const initialProgress = 0;
          const orderProgress = parseInt(res.rows[0].progress, 10);

          if (((orderStatus === 'paid') && (orderProgress === 100))
            || orderStatus === 'rated') {
            // order has already been paid or rated for and complete
            return response.status(409).send({ status: 409, reason: 'Order Already Completed' });
          }

          let orderTotal = parseFloat(res.rows[0].ordertotal);
          for (let oi = 0; oi < reqBody.orderItems.length; oi++) {
            // add items to order
            // eslint-disable-next-line no-await-in-loop
            const itemOrdered = await client.query(
              'SELECT quantity, itemtotal FROM public.itemordered'
              + ' WHERE orderid = $1::integer AND menuitemid = $2::integer',
              [reqBody.orderId, reqBody.orderItems[oi].menuItemId]
            );

            if (itemOrdered.rows.length === 0) {
              // add item
              // eslint-disable-next-line no-await-in-loop
              await client.query(
                'INSERT INTO public.itemordered (orderid, menuitemid, quantity, orderselections, progress, itemtotal)'
              + ' VALUES ($1::integer, $2::integer, $3::integer, $4::json, $5::integer, $6::real)',
                [
                  reqBody.orderId,
                  reqBody.orderItems[oi].menuItemId,
                  reqBody.orderItems[oi].quantity,
                  // eslint-disable-next-line max-len
                  Object.keys(reqBody.orderItems[oi].orderSelections).length === 0
                    ? null : reqBody.orderItems[oi].orderSelections,
                  initialProgress,
                  reqBody.orderItems[oi].itemTotal
                ]
              );
            } else {
              // update and increase quanity
              const orderProgressReset = 0;
              // eslint-disable-next-line no-await-in-loop
              await client.query(
                'UPDATE public.itemordered SET quantity = $1::integer, progress = $2::integer,'
                + ' itemtotal = $3::real WHERE orderid = $4::integer AND menuitemid = $5::integer',
                [
                  reqBody.orderItems[oi].quantity + itemOrdered.rows[0].quantity,
                  orderProgressReset,
                  reqBody.orderItems[oi].itemTotal + itemOrdered.rows[0].itemtotal,
                  reqBody.orderId,
                  reqBody.orderItems[oi].menuItemId
                ]
              );
            }
            orderTotal += parseFloat(reqBody.orderItems[oi].itemTotal);
          }

          // update order total
          await client.query(
            'UPDATE public.customerorder SET ordertotal = $1::real WHERE orderid = $2::integer',
            [orderTotal, reqBody.orderId]
          );

          // update order progress
          await client.query(
            'UPDATE public.customerorder SET progress = subquery.orderprogress'
            + ' FROM (SELECT CAST(AVG(itemordered.progress) AS INTEGER) as "orderprogress"'
            + ' FROM public.itemordered'
            + ' INNER JOIN public.customerorder ON itemordered.orderid = customerorder.orderid'
            + ' WHERE customerorder.orderid = $1::integer) AS "subquery"'
            + ' WHERE orderid = $1::integer',
            [reqBody.orderId]
          );

          // commit changes
          await client.query('COMMIT');

          // Get order history
          const orderResponse = {};
          const orderHistoryPromise = await getOrderHistory(customerId);

          orderResponse.orderHistory = [];
          Promise.all(orderHistoryPromise)
            .then((orderHistoryItem) => {
              orderHistoryItem.forEach((ordHistItem) => {
                orderResponse.orderHistory.push(ordHistItem);
              });

              // refresh ML API cache
              axios.post(mlApiURL,
                {
                  requestType: 'clearOrdersCache',
                  token: reqBody.token
                }).catch((err) => {
                console.error('ML API Orders Cache Reset -', err.stack);
              });

              // send response
              return response.status(201).send(orderResponse);
            })
            .catch((err) => {
              console.error('Add Order Promise Error', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
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
          console.error('Query Error [Add Order]', err.stack);
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
      return (async () => {
        const client = await db.connect();
        try {
          await client.query('BEGIN');
          const res = await client.query(
            'SELECT orderstatus, progress FROM public.customerorder WHERE orderid = $1::integer;',
            [reqBody.orderId]
          );

          if (res.rows.length === 0) {
            // order does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          const orderStatusResponse = {};
          orderStatusResponse.orderStatus = res.rows[0].orderstatus;
          orderStatusResponse.orderProgress = res.rows[0].progress;
          orderStatusResponse.itemProgress = [];

          const itemProg = await client.query(
            'SELECT menuitemid, progress FROM public.itemordered'
            + ' WHERE orderid = $1::integer',
            [reqBody.orderId]
          );

          for (let i = 0; i < itemProg.rows.length; i++) {
            const singleItem = {};
            singleItem.menuItemId = itemProg.rows[i].menuitemid;
            singleItem.progress = itemProg.rows[i].progress;
            orderStatusResponse.itemProgress.push(singleItem);
          }

          // commit and return order status
          await client.query('COMMIT');
          return response.status(200).send(orderStatusResponse);
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Get Order Status]', err.stack);
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
  orderPayment: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'orderId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'paymentMethod')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'amountPaid')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantName')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'menuitemname')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'name')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'email')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'waiterTip')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'orderTax')
      || Object.keys(reqBody).length !== 11
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
            return response.status(205).send({ status: 205, reason: ' Order has already been paid for ' });
          }

          // for payment email data
          const paymentData = {};
          paymentData.orderId = reqBody.orderId;
          paymentData.name = reqBody.name;
          paymentData.email = reqBody.email;
          paymentData.amountPaid = reqBody.amountPaid; // under items ordered
          paymentData.menuitemname = reqBody.menuitemname;
          paymentData.paymentMethod = reqBody.paymentMethod;
          paymentData.waiterTip = reqBody.waiterTip;
          paymentData.orderTax = reqBody.orderTax;
          paymentData.restaurantName = reqBody.restaurantName;
          // pay for order
          const newOrderStatus = 'Paid';

          return dbw.query(
            'INSERT INTO public.payment (orderid, paymentmethod, paymentamount, paymentdatetime)'
            + ' VALUES ($1::integer, $2::text, $3::real, NOW());',
            [reqBody.orderId, reqBody.paymentMethod, reqBody.amountPaid]
          )
            .then(() => dbw.query(
              'UPDATE public.customerorder SET orderstatus = $1::text WHERE orderid = $2::integer',
              [newOrderStatus, reqBody.orderId]
            )
              .then(() => {
                paymentEmail.paymentEmail(paymentData); // send payment email
                return response.status(200).send({ status: 200, reason: ' Payment Successful ' });
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
              let isMenuItemReview = false;
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
                  isMenuItemReview = true;
                  break;
              }

              rQuery += ') VALUES ';
              rQuery += '($1::integer, NOW(), $2::real, $3::text, $4::boolean, $5::integer)';
              rQuery += ' RETURNING reviewid;';
              return dbw.query(rQuery, [
                reqBody.orderId,
                reqBody.ratingScore,
                reqBody.comment === '' ? null : reqBody.comment,
                reqBody.public,
                reqBody.itemId
              ])
                .then((rRes) => {
                  // add phrases
                  reqBody.phrases.forEach((rPhrase) => {
                    Promise.resolve(dbw.query(
                      'INSERT INTO public.customerphraserating (reviewid, phraseid, ratingscore)'
                      + ' VALUES ($1::integer, $2::integer, $3::real);',
                      [rRes.rows[0].reviewid, rPhrase.phraseId, rPhrase.phraseScore]
                    ));
                  });

                  // Update order status
                  return dbw.query(
                    'UPDATE public.customerorder SET orderstatus = $1::text WHERE orderid = $2::integer',
                    ['Rated', reqBody.orderId]
                  )
                    .then(() => {
                      if (isMenuItemReview) {
                        // refresh ML API cache
                        axios.post(mlApiURL,
                          {
                            requestType: 'clearRatingsCache',
                            token: reqBody.token
                          }).catch((err) => {
                          console.error('ML API Ratings Cache Reset -', err.stack);
                        });
                      }

                      return response.status(201).send({ status: 201, reason: 'Reivew Recorded' });
                    })
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
  },
  // eslint-disable-next-line consistent-return
  getSuggestedMenuItems: (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      const menuItemsList = [];
      const menuItemPromises = [];

      reqBody.menuItems.forEach((menuItem) => {
        menuItemPromises.push(new Promise((resolve, reject) => {
          Promise.all(menuItemPromises)
            .then(async () => {
              const menuItemObj = {};
              const res = await db.query(
                'SELECT menuitemid, restaurantid, menuitemname, menuitemdescription, price, estimatedwaitingtime,'
                + ' menuitem.attributes, arasset, availability FROM public.menuitem'
                + ' WHERE menuitemid = $1::integer ORDER BY menuitemid ASC;',
                [menuItem]
              );

              menuItemObj.menuItemInfo = {};

              for (let r = 0; r < res.rows.length; r++) {
                menuItemObj.menuItemInfo = res.rows[r];
              }

              const res2 = await db.query(
                'SELECT imageurl FROM public.menuitemimages'
                + ' WHERE menuitemid = $1::integer ORDER BY menuitemid ASC;',
                [menuItem]
              );

              menuItemObj.menuItemInfo.images = [];

              for (let i = 0; i < res2.rows.length; i++) {
                menuItemObj.menuItemInfo.images.push(res2.rows[i]);
              }

              menuItemsList.push(menuItemObj);
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        }));
      });

      Promise.all(menuItemPromises).then(() => response.status(200).send(menuItemsList));
    }
  },
  getAllActivePromotions: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || Object.keys(reqBody).length !== 2) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      // eslint-disable-next-line consistent-return
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          const resObj = {};
          const resPromise = await getActivePromotions(reqBody.restaurantId);
          resObj.restaurantPromo = [];

          Promise.all(resPromise)
            .then((group) => {
              group.forEach((groupItems) => {
                resObj.restaurantPromo.push(groupItems);
              });
              return response.status(201).send(resObj);
            })
            .catch((err) => {
              console.error('Add Review Promise Error', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        } catch (err) {
          // rollback changes
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Get Promotion List]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
};
