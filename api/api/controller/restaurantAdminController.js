/* eslint-disable linebreak-style */
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
            'INSERT INTO public.restaurant (restaurantname,restaurantdescription,branch,location,coverimageurl, in_business)'
            + ' VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::boolean)'
            + ' RETURNING restaurantid',
            [
              reqBody.name,
              reqBody.description,
              reqBody.branch,
              reqBody.location,
              reqBody.coverImageURL,
              true
            ]
          );

          // add restaurant admin
          const employeeRole = 'Admin';
          const employeeNumber = `emp${cRes.rows[0].restaurantid}${userToken.data.userId}`;
          const empId = await client.query(
            'INSERT INTO public.restaurantemployee (userid, restaurantid, employeerole, employeenumber)'
            + ' VALUES ($1::integer, $2::integer, $3::text, $4::text)'
            + ' RETURNING employeeid',
            [userToken.data.userId, cRes.rows[0].restaurantid, employeeRole, employeeNumber]
          );

          const accessRights = await client.query(
            'SELECT permissionid FROM public.accessright'
          );
          accessRights.rows.forEach(async (right) => {
            await client.query(
              'INSERT INTO public.employeeaccessright (employeeid, permissionid)'
              + ' VALUES ($1::integer, $2::integer)',
              [empId.rows[0].employeeid, right.permissionid]
            );
          });

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
  editRestaurant: async (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'name')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'description')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'branch')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'location')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categories')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'coverImageURL')
      || !Array.isArray(reqBody.categories)
      || Object.keys(reqBody).length !== 9) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

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

          // check if admin rights
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

          // edit restaurant
          await client.query(
            'UPDATE public.restaurant'
            + ' SET restaurantname = $1::text, restaurantdescription = $2::text,'
            + ' branch = $3::text, location = $4::text,'
            + ' coverimageurl = $5::text'
            + ' WHERE restaurantid = $6::integer',
            [
              reqBody.name,
              reqBody.description,
              reqBody.branch,
              reqBody.location,
              reqBody.coverImageURL,
              reqBody.restaurantId
            ]
          );

          await client.query(
            'DELETE FROM public.restaurantcategory WHERE restaurantId = $1::integer;',
            [reqBody.restaurantId]
          );

          // add new categories
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
              [parseInt(reqBody.categories[c], 10), reqBody.restaurantId]
            );
          }

          // commit changes
          await client.query('COMMIT');

          const rest = await client.query(
            'SELECT * FROM public.restaurant'
            + ' WHERE restaurantid = $1::integer',
            [reqBody.restaurantId]
          );

          const categories = await client.query(
            'SELECT category.categoryname FROM public.restaurantcategory'
            + ' INNER JOIN public.category on category.categoryid = restaurantcategory.categoryid'
            + ' WHERE restaurantid = $1::integer',
            [reqBody.restaurantId]
          );

          const categoryList = [];
          categories.rows.forEach((category) => {
            categoryList.push(category.categoryname);
          });

          // send response
          return response.status(201).send({
            name: rest.rows[0].restaurantname,
            description: rest.rows[0].restaurantdescription,
            branch: rest.rows[0].branch,
            location: rest.rows[0].location,
            categories: categoryList,
            coverImageURL: rest.rows[0].coverimageurl
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
          console.error('Query Error [Restaurant Admin - Edit Restaurant]', err.stack);
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
          const permission = 'tables';
          const permRes = await client.query(
            'SELECT employeeaccessright.permissionid FROM public.employeeaccessright'
            + ' INNER JOIN public.accessright ON accessright.permissionid = employeeaccessright.permissionid'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.employeeid = employeeaccessright.employeeid'
            + ' WHERE restaurantemployee.userid = $1::integer AND restaurantemployee.restaurantid = $2::integer AND LOWER(accessright.description) = $3::text',
            [userToken.data.userId, reqBody.restaurantId, permission]
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
          return response.status(201).send({
            tableId: tblRes.rows[0].tableid,
            qrcode
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
  editTable: (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'tableId')
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

          // check if table exists
          const tRes = await client.query(
            'SELECT restaurantid FROM public.restauranttable WHERE tableid = $1::integer',
            [reqBody.tableId]
          );

          if (tRes.rows.length === 0) {
            // table does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check user permissions
          const permission = 'tables';
          const permRes = await client.query(
            'SELECT employeeaccessright.permissionid FROM public.employeeaccessright'
            + ' INNER JOIN public.accessright ON accessright.permissionid = employeeaccessright.permissionid'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.employeeid = employeeaccessright.employeeid'
            + ' WHERE restaurantemployee.userid = $1::integer AND restaurantemployee.restaurantid = $2::integer AND LOWER(accessright.description) = $3::text',
            [userToken.data.userId, tRes.rows[0].restaurantid, permission]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          // check if the table number is now already in use
          const tblDup = await client.query(
            'SELECT tablenumber FROM public.restauranttable'
            + ' WHERE restaurantid = $1::integer AND tablenumber = $2::text',
            [tRes.rows[0].restaurantid, reqBody.tableNumber]
          );

          if (tblDup.rows.length > 0) {
            // table number already in use
            return response.status(409).send({ status: 409, reason: 'Table Number Already In Use' });
          }

          // edit table
          await client.query(
            'UPDATE public.restauranttable'
            + ' SET tablenumber = $1::text, numseats = $2::integer'
            + ' WHERE tableid = $3::integer',
            [
              reqBody.tableNumber,
              parseInt(reqBody.seatCount, 10),
              reqBody.tableId
            ]
          );

          // commit changes
          await client.query('COMMIT');

          const tableInfo = await client.query(
            'SELECT * FROM public.restauranttable WHERE tableid = $1::integer',
            [reqBody.tableId]
          );

          // send response
          return response.status(201).send({
            tableId: tableInfo.rows[0].tableid,
            tableNumber: tableInfo.rows[0].tablenumber,
            seatCount: tableInfo.rows[0].numseats,
            qrcode: tableInfo.rows[0].qrcode
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
          console.error('Query Error [Restaurant Admin - Edit Restaurant Table]', err.stack);
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
  },
  addMenuCategory: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categoryName')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categoryDescription')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categoryType')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'parentCategoryId')
      || (reqBody.categoryType.toLowerCase() !== 'primary'
        && reqBody.categoryType.toLowerCase() !== 'secondary')
      || (reqBody.categoryType.toLowerCase() === 'secondary'
        // eslint-disable-next-line no-restricted-globals
        && (isNaN(reqBody.parentCategoryId) || reqBody.parentCategoryId == null))
      || Object.keys(reqBody).length !== 7) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

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
          const permission = 'restaurant menu';
          const permRes = await client.query(
            'SELECT employeeaccessright.permissionid FROM public.employeeaccessright'
            + ' INNER JOIN public.accessright ON accessright.permissionid = employeeaccessright.permissionid'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.employeeid = employeeaccessright.employeeid'
            + ' WHERE restaurantemployee.userid = $1::integer AND restaurantemployee.restaurantid = $2::integer AND LOWER(accessright.description) = $3::text',
            [userToken.data.userId, reqBody.restaurantId, permission]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          // check for parent category
          if (reqBody.categoryType.toLowerCase() === 'secondary') {
            const pRes = await client.query(
              'SELECT categoryname FROM public.menucategory WHERE categoryid = $1::integer',
              [reqBody.parentCategoryId]
            );

            if (pRes.rows.length === 0) {
              // parent category not found
              return response.status(404).send({ status: 404, reason: 'Not Found' });
            }
          }

          // insert new category
          const catId = await client.query(
            'INSERT INTO public.menucategory'
            + ' (categoryname, categorydescription, categorytype, parentcategoryid, restaurantid)'
            + ' VALUES ($1::text, $2::text, $3::text, $4::integer, $5::integer)'
            + ' RETURNING categoryid',
            [
              reqBody.categoryName,
              reqBody.categoryDescription,
              reqBody.categoryType,
              (reqBody.categoryType.toLowerCase() === 'secondary') ? reqBody.parentCategoryId : null,
              reqBody.restaurantId
            ]
          );

          // commit changes and end transaction
          await client.query('COMMIT');

          // return newly created category id
          return response.status(201).send({ categoryId: catId.rows[0].categoryid });
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
  editMenuCategory: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categoryId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categoryName')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categoryDescription')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categoryType')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'parentCategoryId')
      || (reqBody.categoryType.toLowerCase() !== 'primary'
        && reqBody.categoryType.toLowerCase() !== 'secondary')
      || (reqBody.categoryType.toLowerCase() === 'secondary'
        // eslint-disable-next-line no-restricted-globals
        && (isNaN(reqBody.parentCategoryId) || reqBody.parentCategoryId == null))
      || Object.keys(reqBody).length !== 7) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if category exists
          const cRes = await client.query(
            'SELECT restaurantid FROM public.menucategory WHERE categoryid = $1::integer',
            [reqBody.categoryId]
          );

          if (cRes.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check user permissions
          const permission = 'restaurant menu';
          const permRes = await client.query(
            'SELECT employeeaccessright.permissionid FROM public.employeeaccessright'
            + ' INNER JOIN public.accessright ON accessright.permissionid = employeeaccessright.permissionid'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.employeeid = employeeaccessright.employeeid'
            + ' WHERE restaurantemployee.userid = $1::integer AND restaurantemployee.restaurantid = $2::integer AND LOWER(accessright.description) = $3::text',
            [userToken.data.userId, cRes.rows[0].restaurantid, permission]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          // check for parent category
          if (reqBody.categoryType.toLowerCase() === 'secondary') {
            const pRes = await client.query(
              'SELECT categoryname FROM public.menucategory WHERE categoryid = $1::integer',
              [reqBody.parentCategoryId]
            );

            if (pRes.rows.length === 0) {
              // parent category not found
              return response.status(404).send({ status: 404, reason: 'Not Found' });
            }
          }

          // update category
          await client.query(
            'UPDATE public.menucategory'
            + ' SET categoryname = $1::text, categorydescription = $2::text, categorytype = $3::text, parentcategoryid = $4::integer',
            [
              reqBody.categoryName,
              reqBody.categoryDescription,
              reqBody.categoryType,
              (reqBody.categoryType.toLowerCase() === 'secondary') ? reqBody.parentCategoryId : null
            ]
          );

          // commit changes and end transaction
          await client.query('COMMIT');

          const categ = await client.query(
            'SELECT * FROM public.menucategory WHERE categoryid = $1::integer',
            [reqBody.categoryId]
          );

          // return edited category info
          return response.status(201).send({
            categoryId: categ.rows[0].categoryid,
            name: categ.rows[0].categoryname,
            description: categ.rows[0].categorydescription,
            type: categ.rows[0].categorytype,
            parentCategoryId: categ.rows[0].parentcategoryid
          });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Edit Menu Category]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  addMenuItem: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categoryId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'itemName')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'itemDescription')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'price')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'waitingTime')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'attributes')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'arAsset')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'available')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'images')
      || Object.keys(reqBody).length !== 12) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if restaurant with the given category exists
          const cRes = await client.query(
            'SELECT categoryname FROM public.menucategory'
            + ' WHERE categoryid = $1::integer AND restaurantid = $2::integer',
            [reqBody.categoryId, reqBody.restaurantId]
          );

          if (cRes.rows.length === 0) {
            // restaurant with that category does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check user permissions
          const permission = 'restaurant menu';
          const permRes = await client.query(
            'SELECT employeeaccessright.permissionid FROM public.employeeaccessright'
            + ' INNER JOIN public.accessright ON accessright.permissionid = employeeaccessright.permissionid'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.employeeid = employeeaccessright.employeeid'
            + ' WHERE restaurantemployee.userid = $1::integer AND restaurantemployee.restaurantid = $2::integer AND LOWER(accessright.description) = $3::text',
            [userToken.data.userId, reqBody.restaurantId, permission]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          // add menu item
          const menuItemRes = await client.query(
            'INSERT INTO public.menuitem (categoryid, menuitemname, menuitemdescription,'
            + 'price, estimatedwaitingtime, attributes, arasset, availability) VALUES ($1::integer,'
            + '$2::text,$3::text,$4::real,$5::text,$6::json,$7::text,$8::boolean)'
            + ' RETURNING menuitemid',
            [
              reqBody.categoryId,
              reqBody.itemName,
              reqBody.itemDescription,
              reqBody.price,
              reqBody.waitingTime,
              reqBody.attributes,
              reqBody.arAsset,
              reqBody.available
            ]
          );

          // insert images
          for (let i = 0; i < reqBody.images.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            await client.query(
              'INSERT INTO menuitemimages (menuitemid, imageurl) VALUES ($1::integer,$2::text)',
              [menuItemRes.rows[0].menuitemid, reqBody.images[i]]
            );
          }

          // commit changes and end transaction
          await client.query('COMMIT');

          // return newly created menu item id
          return response.status(201).send({ menuItemId: menuItemRes.rows[0].menuitemid });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Add Menu Item]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  editMenuItem: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'menuItemId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'categoryId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'itemName')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'itemDescription')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'price')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'waitingTime')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'attributes')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'arAsset')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'available')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'images')
      || Object.keys(reqBody).length !== 12) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await db.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if menu item exists
          const cRes = await client.query(
            'SELECT menucategory.restaurantid FROM public.menuitem'
            + ' INNER JOIN public.menucategory on menucategory.categoryid = menuitem.categoryid'
            + ' WHERE menuitemid = $1::integer',
            [reqBody.menuItemId]
          );

          if (cRes.rows.length === 0) {
            // menu item does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check if category exists at this restaurant
          const categRes = await client.query(
            'SELECT categoryid FROM public.menucategory'
            + ' WHERE categoryid = $1::integer AND restaurantid = $2::integer',
            [reqBody.categoryId, cRes.rows[0].restaurantid]
          );

          if (categRes.rows.length === 0) {
            // categry does not exist at this restaurant
            return response.status(405).send({ status: 405, reason: 'Not Found' });
          }

          // check user permissions
          const permission = 'restaurant menu';
          const permRes = await client.query(
            'SELECT employeeaccessright.permissionid FROM public.employeeaccessright'
            + ' INNER JOIN public.accessright ON accessright.permissionid = employeeaccessright.permissionid'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.employeeid = employeeaccessright.employeeid'
            + ' WHERE restaurantemployee.userid = $1::integer AND restaurantemployee.restaurantid = $2::integer AND LOWER(accessright.description) = $3::text',
            [userToken.data.userId, cRes.rows[0].restaurantid, permission]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          // edit menu item
          const menuItemRes = await client.query(
            'UPDATE public.menuitem'
            + ' SET categoryid = $1::integer, menuitemname = $2::text, menuitemdescription = $3::text, price = $4::real, estimatedwaitingtime = $5::text, attributes = $6::json, arasset = $7::text, availability = $8::boolean'
            + ' WHERE menuitemid = $9::integer',
            [
              reqBody.categoryId,
              reqBody.itemName,
              reqBody.itemDescription,
              reqBody.price,
              reqBody.waitingTime,
              reqBody.attributes,
              reqBody.arAsset,
              reqBody.available,
              reqBody.menuItemId
            ]
          );

          await client.query(
            'DELETE FROM public.menuitemimages WHERE menuitemid = $1::integer',
            [reqBody.menuItemId]
          );

          // insert images
          for (let i = 0; i < reqBody.images.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            await client.query(
              'INSERT INTO menuitemimages (menuitemid, imageurl) VALUES ($1::integer,$2::text)',
              [menuItemRes.rows[0].menuitemid, reqBody.images[i]]
            );
          }

          // commit changes and end transaction
          await client.query('COMMIT');

          const itemInfo = await client.query(
            'SELECT * FROM public.menuitem WHERE menuitemid = $1::integer',
            [reqBody.menuItemId]
          );

          const menuImage = await client.query(
            'SELECT imageurl FROM public.menuitemimages WHERE menuitemid = $1::integer',
            [reqBody.menuItemId]
          );

          const itemImages = [];
          menuImage.rows.forEach((image) => {
            itemImages.push(image.imageurl);
          });

          // return edited menu item info
          return response.status(201).send({
            menuItemId: itemInfo.rows[0].menuitemid,
            categoryId: itemInfo.rows[0].categoryid,
            name: itemInfo.rows[0].menuitemname,
            description: itemInfo.rows[0].menuitemdescription,
            price: itemInfo.rows[0].price,
            waitingTime: itemInfo.rows[0].estimatedwaitingtime,
            attributes: itemInfo.rows[0].attributes,
            arAsset: itemInfo.rows[0].arasset,
            available: itemInfo.rows[0].availability,
            images: itemImages,
          });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Edit Menu Item]', err.stack);
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
