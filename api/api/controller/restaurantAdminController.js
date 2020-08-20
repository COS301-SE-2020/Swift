const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { validateToken, tokenState } = require('../helper/tokenHandler');
const {
  getReviews,
  // getRatingPhrasesObj,
  getMenuCategories,
  // getOrderHistory,
  // getOrderItems
} = require('../helper/objectBuilder');

module.exports = {
  createRestaurant: async (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'name')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'description')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'branch')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'location')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categories')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'coverImageURL')
      || !Array.isArray(reqBody.categories)
      || reqBody.categories.length < 1
      || Object.keys(reqBody).length !== 8) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // create restaurant
          const cRes = await client.query(
            'INSERT INTO public.restaurant (restaurantname,restaurantdescription,branch,location,coverimageurl)'
            + ' VALUES ($1::text, $2::text, $3::text, $4::text, $5::text)'
            + ' RETURNING restaurantid',
            [
              reqBody.name,
              reqBody.description,
              reqBody.branch,
              reqBody.location,
              reqBody.coverImageURL
            ]
          );

          // add restaurant admin
          const employeeRole = 'Admin';
          const employeeNumber = `emp${cRes.rows[0].restaurantid}${userToken.data.userId}`;
          await client.query(
            'INSERT INTO public.restaurantemployee (userid, restaurantid, employeerole, employeenumber)'
            + ' VALUES ($1::integer, $2::integer, $3::text, $4::text)',
            [userToken.data.userId, cRes.rows[0].restaurantid, employeeRole, employeeNumber]
          );

          // add categories
          for (let c = 0; c < reqBody.categories.length; c++) {
            // check if category exists
            // eslint-disable-next-line no-await-in-loop
            const catRes = await client.query(
              'SELECT categoryid FROM public.category WHERE categoryid = $1::integer;',
              [reqBody.categories[c]]
            );

            if (catRes.rows.length === 0) {
              // undo changes
              // eslint-disable-next-line no-await-in-loop
              await client.query('ROLLBACK');
              return response.status(404).send({
                status: 404,
                reason: 'Category Not Found',
                category: reqBody.categories[c]
              });
            }

            // associate categories with restaurant
            // eslint-disable-next-line no-await-in-loop
            await client.query(
              'INSERT INTO public.restaurantcategory (categoryid, restaurantid)'
              + ' VALUES ($1::integer, $2::integer)',
              [parseInt(reqBody.categories[c], 10), cRes.rows[0].restaurantid]
            );
          }

          // commit changes
          await client.query('COMMIT');

          // send response
          return response.status(201).send({ restaurantId: cRes.rows[0].restaurantid });
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
          console.error('Query Error [Restaurant Admin - Create Restaurant]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
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
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if restaurant exists
          const cRes = await client.query(
            'SELECT restaurantname FROM public.restaurant WHERE restaurantid = $1::integer',
            [reqBody.restaurantId]
          );

          if (cRes.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check user permissions
          const requiredRole = 'admin';
          const permRes = await client.query(
            'SELECT employeerole FROM public.restaurantemployee'
            + ' WHERE userid = $1::integer AND restaurantid = $2::integer AND LOWER(employeerole) = $3::text',
            [userToken.data.userId, reqBody.restaurantId, requiredRole]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          // check if the table number is now already in use
          const tblDup = await client.query(
            'SELECT tablenumber FROM public.restauranttable'
            + ' WHERE restaurantid = $1::integer AND tablenumber = $2::text',
            [reqBody.restaurantId, reqBody.tableNumber]
          );

          if (tblDup.rows.length > 0) {
            // table number already in use
            return response.status(409).send({ status: 409, reason: 'Table Number Already In Use' });
          }

          // create table
          const qrcode = uuidv4().replace(/-/g, ''); // UUID v4 without dashes (~10^-37 collison rate)
          const tblRes = await client.query(
            'INSERT INTO public.restauranttable'
            + ' (restaurantid, numseats, tablenumber, qrcode)'
            + ' VALUES ($1::integer, $2::integer, $3::text, $4::text)'
            + ' RETURNING tableid;',
            [
              reqBody.restaurantId,
              parseInt(reqBody.seatCount, 10),
              reqBody.tableNumber,
              qrcode
            ]
          );

          // commit changes
          await client.query('COMMIT');

          // send response
          return response.status(201).send({ tableId: tblRes.rows[0].tableid, qrcode });
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
          console.error('Query Error [Restaurant Admin - Create Restaurant Table]', err.stack);
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
      || !Object.prototype.hasOwnProperty.call(reqBody, 'includeProfileImage')
      // eslint-disable-next-line no-mixed-operators
      && (!Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'tableId'))
      // eslint-disable-next-line no-mixed-operators
      || Object.keys(reqBody).length !== 4) {
      return response.status(400).send({ status: 400, reason: 'Bad Requesst' });
    }

    // Check token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      let allTablesStatus = false;
      if (Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')) {
        allTablesStatus = true;
      }

      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

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

          const rtRes = await client.query(ecQuery, [queryID]);
          if (rtRes.rows.length === 0 && !allTablesStatus) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          let permQueryId = queryID;
          if (!allTablesStatus) {
            // get restaurant containing table
            const restId = await client.query(
              'SELECT restaurantid FROM public.restauranttable WHERE tableid = $1::integer',
              [queryID]
            );
            permQueryId = restId.rows[0].restaurantid;
          }

          // check user permissions - employee role at restaurant
          const permRes = await client.query(
            'SELECT employeerole FROM public.restaurantemployee'
            + ' WHERE userid = $1::integer AND restaurantid = $2::integer',
            [userToken.data.userId, permQueryId]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          // get table statuses
          let sQuery = 'SELECT tableid, tablenumber, numseats, qrcode';
          sQuery += ' FROM public.restauranttable';
          if (allTablesStatus) {
            sQuery += ' WHERE restaurantid = $1::integer;';
          } else {
            sQuery += ' WHERE tableid = $1::integer;';
          }

          const tblStat = await client.query(sQuery, [queryID]);
          const tableStatusResponse = {};
          tableStatusResponse.result = [];
          for (let t = 0; t < tblStat.rows.length; t++) {
            const singleTableStatus = {};
            singleTableStatus.tableId = tblStat.rows[t].tableid;
            singleTableStatus.tableNumber = tblStat.rows[t].tablenumber;
            singleTableStatus.numSeats = tblStat.rows[t].numseats;
            singleTableStatus.checkedIn = [];

            // get checked in users
            let chkInUserQuery = 'SELECT name, surname';
            if (reqBody.includeProfileImage === true) {
              chkInUserQuery += ', profileimageurl';
            }
            chkInUserQuery += ' FROM public.person WHERE checkedin = $1::text';
            // eslint-disable-next-line no-await-in-loop
            const checkedInUsers = await client.query(chkInUserQuery, [tblStat.rows[t].qrcode]);
            for (let ci = 0; ci < checkedInUsers.rows.length; ci++) {
              const userObj = {};
              userObj.name = checkedInUsers.rows[ci].name;
              userObj.surname = checkedInUsers.rows[ci].surname;
              userObj.profileImageURL = reqBody.includeProfileImage === true
                ? checkedInUsers.rows[ci].profileimageurl : null;

              // add to response
              singleTableStatus.checkedIn.push(userObj);
            }

            singleTableStatus.qrcode = tblStat.rows[t].qrcode;
            tableStatusResponse.result.push(singleTableStatus);
          }

          // commit changes and return statuses
          await client.query('COMMIT');
          return response.status(200).send(tableStatusResponse);
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
          console.error('Query Error [Restaurant Admin - Get Restaurant Table Status]', err.stack);
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
      || !Object.prototype.hasOwnProperty.call(reqBody, 'menuItemId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'percentage')
      || Object.keys(reqBody).length !== 5) {
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

          // check if order exists
          const oRes = await client.query(
            'SELECT restauranttable.restaurantid FROM public.itemordered'
            + ' INNER JOIN public.customerorder ON itemordered.orderid = customerorder.orderid'
            + ' INNER JOIN public.restauranttable ON customerorder.tableid = restauranttable.tableid'
            + ' WHERE itemordered.orderid = $1::integer AND itemordered.menuitemid = $2::integer',
            [reqBody.orderId, reqBody.menuItemId]
          );

          if (oRes.rows.length === 0) {
            // order does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check user permissions - employee role at restaurant
          const permRes = await client.query(
            'SELECT employeerole FROM public.restaurantemployee'
            + ' WHERE userid = $1::integer AND restaurantid = $2::integer',
            [userToken.data.userId, oRes.rows[0].restaurantid]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          // check if percentage is within range
          const orderPercentage = parseInt(reqBody.percentage, 10);
          if (orderPercentage < 0 || orderPercentage > 100) {
            return response.status(400).send({ status: 400, reason: 'Bad Request' });
          }

          // update order item progress
          await client.query(
            'UPDATE public.itemordered SET progress = $1::integer'
            + ' WHERE orderid = $2::integer AND menuitemid = $3::integer',
            [orderPercentage, reqBody.orderId, reqBody.menuItemId]
          );

          // update overall order progress
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

          // send response
          return response.status(200).send();
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
          console.error('Query Error [Restaurant Admin - Create Restaurant Table]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getRestaurantList: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'includeImage')
      || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');
          const res = await client.query(
            'SELECT restaurant.restaurantid, restaurant.restaurantname, restaurant.branch,'
            + ' restaurant.location, restaurant.coverimageurl, restaurantemployee.employeerole,'
            + ' restaurant.restaurantdescription FROM public.restaurantemployee'
            + ' INNER JOIN public.restaurant ON restaurant.restaurantid = restaurantemployee.restaurantid'
            + ' WHERE restaurantemployee.userid = $1::integer',
            [userToken.data.userId]
          );

          const restaurantResponse = {};
          restaurantResponse.restaurants = [];

          for (let r = 0; r < res.rows.length; r++) {
            restaurantResponse.restaurants[r] = {};
            restaurantResponse.restaurants[r].restaurantId = res.rows[r].restaurantid;
            restaurantResponse.restaurants[r].name = res.rows[r].restaurantname;
            restaurantResponse.restaurants[r].description = res.rows[r].restaurantdescription;
            restaurantResponse.restaurants[r].yourRole = res.rows[r].employeerole;
            restaurantResponse.restaurants[r].branch = res.rows[r].branch;
            restaurantResponse.restaurants[r].location = res.rows[r].location;
            restaurantResponse.restaurants[r].image = (reqBody.includeImage === true)
              ? res.rows[r].coverimageurl : null;

            // eslint-disable-next-line operator-linebreak
            restaurantResponse.restaurants[r].categories =
              // eslint-disable-next-line no-await-in-loop
              await getMenuCategories(res.rows[r].restaurantid);
            // eslint-disable-next-line no-await-in-loop
            restaurantResponse.restaurants[r].reviews = await getReviews(res.rows[r].restaurantid);

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

          // commit changes
          await client.query('COMMIT');

          return response.status(200).send(restaurantResponse);
        } catch (err) {
          // rollback changes
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Get Admin Restaurant List]', err.stack);
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
