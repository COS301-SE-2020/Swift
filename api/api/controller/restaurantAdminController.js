/* eslint-disable linebreak-style */
const { v4: uuidv4 } = require('uuid');
const db = require('../db').poolr;
const dbw = require('../db').poolw;
const { validateToken, tokenState } = require('../helper/tokenHandler');
const {
  getReviews,
  getEmployeeReviews,
  getEmployeeOrders,
  getEmployeeRights,
  getEmployeeRatings,
  getAvgScore,
  getPromotionElements,
  // getRatingPhrasesObj,
  getMenuCategories,
  getEmployees,
  // getAllReviews,
  // getOrderHistory,
  // getOrderItems
} = require('../helper/objectBuilder');
const { employSignInEmail, employRegisEmail } = require('../helper/notifications/sendEmail');

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
      || reqBody.categories.length < 1) {
      // || Object.keys(reqBody).length !== 8) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // create restaurant
          const cRes = await client.query(
            'INSERT INTO public.restaurant (restaurantname,restaurantdescription,branch,location,coverimageurl, order_service_goal, in_business)'
            + ' VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::integer, $7::boolean)'
            + ' RETURNING restaurantid',
            [
              reqBody.name,
              reqBody.description,
              reqBody.branch,
              reqBody.location,
              reqBody.coverImageURL,
              (Object.prototype.hasOwnProperty.call(reqBody, 'serviceGoal'))
                ? reqBody.serviceGoal : null,
              (Object.prototype.hasOwnProperty.call(reqBody, 'inBusiness'))
                ? reqBody.inBusiness : true
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
      || !Array.isArray(reqBody.categories)) {
      // || Object.keys(reqBody).length !== 9) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if restaurant exists
          const cRes = await client.query(
            'SELECT restaurantname, order_service_goal, in_business FROM public.restaurant WHERE restaurantid = $1::integer',
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
            + ' coverimageurl = $5::text, order_service_goal = $6::integer, in_business = $7::boolean'
            + ' WHERE restaurantid = $8::integer',
            [
              reqBody.name,
              reqBody.description,
              reqBody.branch,
              reqBody.location,
              reqBody.coverImageURL,
              (Object.prototype.hasOwnProperty.call(reqBody, 'serviceGoal'))
                ? reqBody.serviceGoal : cRes.rows[0].order_service_goal,
              (Object.prototype.hasOwnProperty.call(reqBody, 'inBusiness'))
                ? reqBody.inBusiness : cRes.rows[0].in_business,
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
            inBusiness: rest.rows[0].in_business,
            serviceGoal: rest.rows[0].order_service_goal,
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
        const client = await dbw.connect();
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
          let unique = false;
          let code = '';
          const codeLength = 7;
          const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

          while (!unique) {
            for (let i = 0; i < codeLength; i++) {
              code += symbols.charAt(Math.floor(Math.random() * symbols.length));
            }

            // eslint-disable-next-line no-await-in-loop
            const table = await client.query(
              'SELECT tablenumber FROM public.restauranttable'
              + ' WHERE code = $1::text',
              [code]
            );

            if (table.rows.length === 0) {
              unique = true;
            }
          }

          const tblRes = await client.query(
            'INSERT INTO public.restauranttable'
            + ' (restaurantid, numseats, tablenumber, qrcode, code)'
            + ' VALUES ($1::integer, $2::integer, $3::text, $4::text, $5::text)'
            + ' RETURNING tableid;',
            [
              reqBody.restaurantId,
              parseInt(reqBody.seatCount, 10),
              reqBody.tableNumber,
              qrcode,
              code
            ]
          );

          // commit changes
          await client.query('COMMIT');

          // send response
          return response.status(201).send({
            tableId: tblRes.rows[0].tableid,
            qrcode,
            code
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
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if table exists
          const tRes = await client.query(
            'SELECT restaurantid, tablenumber FROM public.restauranttable WHERE tableid = $1::integer',
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

          if (reqBody.tableNumber !== tRes.rows[0].tablenumber) {
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
            qrcode: tableInfo.rows[0].qrcode,
            code: tableInfo.rows[0].code
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
        const client = await dbw.connect();
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
            + ' restaurant.location, restaurant.coverimageurl, restaurant.in_business, restaurantemployee.employeerole,'
            + ' restaurant.restaurantdescription, restaurant.order_service_goal FROM public.restaurantemployee'
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
            restaurantResponse.restaurants[r].inBusiness = res.rows[r].in_business;
            restaurantResponse.restaurants[r].serviceGoal = res.rows[r].order_service_goal;
            restaurantResponse.restaurants[r].image = (reqBody.includeImage === true)
              ? res.rows[r].coverimageurl : null;

            // eslint-disable-next-line operator-linebreak
            restaurantResponse.restaurants[r].categories =
              // eslint-disable-next-line no-await-in-loop
              await getMenuCategories(res.rows[r].restaurantid);

            restaurantResponse.restaurants[r].reviews = [];

            // eslint-disable-next-line no-await-in-loop
            const reviewsPromises = await getReviews(res.rows[r].restaurantid);

            // eslint-disable-next-line no-await-in-loop
            await Promise.all(reviewsPromises)
              .then((reviewItem) => {
                reviewItem.forEach((review) => {
                  restaurantResponse.restaurants[r].reviews.push(review);
                });
              });

            // eslint-disable-next-line no-await-in-loop
            const mainCatRes = await client.query(
              'SELECT categoryid FROM public.restaurantcategory'
              + ' WHERE restaurantid = $1::integer;',
              [res.rows[r].restaurantid]
            );

            restaurantResponse.restaurants[r].restaurantCategories = [];
            mainCatRes.rows.forEach((category) => {
              restaurantResponse.restaurants[r].restaurantCategories.push(category.categoryid);
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
  getRestaurantPromotions: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || Object.keys(reqBody).length !== 3) {
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

          // check if restaurant exists
          const cRes = await client.query(
            'SELECT restaurantname FROM public.restaurant WHERE restaurantid = $1::integer',
            [reqBody.restaurantId]
          );

          if (cRes.rows.length === 0) {
            // restaurant does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          const resObj = {};
          const resPromise = await getPromotionElements(reqBody.restaurantId);
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
  getRestaurantReviews: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
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

          // check if restaurant exists
          const cRes = await client.query(
            'SELECT restaurantname FROM public.restaurant WHERE restaurantid = $1::integer',
            [reqBody.restaurantId]
          );

          if (cRes.rows.length === 0) {
            // restaurant does not exist
            client.query('COMMIT');
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          const reviewsResponse = {};
          reviewsResponse.reviews = [];

          const reviewsPromises = await getReviews(reqBody.restaurantId);

          await Promise.all(reviewsPromises)
            .then((reviewItem) => {
              reviewItem.forEach((review) => {
                reviewsResponse.reviews.push(review);
              });
            });

          // commit changes
          await client.query('COMMIT');

          return response.status(200).send(reviewsResponse);
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
        const client = await dbw.connect();
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
  addEmployee: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'email')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'role')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'priviliges')
      || !Array.isArray(reqBody.priviliges)
      || Object.keys(reqBody).length !== 6) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await dbw.connect();
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
          const permission = 'employees';
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
          const { email, role } = reqBody;
          // check if user registered
          const empRes = await client.query(
            'SELECT person.userid FROM public.person WHERE person.email = $1::text',
            [reqBody.email]
          );

          if (empRes.rows.length === 0) {
            // Access denied
            // send email
            employRegisEmail(email);
            return response.status(405).send({ status: 405, reason: 'Employee must be registered on the system' });
          }

          // check if existing employee
          const existingEmp = await client.query(
            'SELECT employeeid FROM public.restaurantemployee WHERE userid = $1::integer AND restaurantid = $2::integer',
            [empRes.rows[0].userid, reqBody.restaurantId]
          );

          if (existingEmp.rows.length !== 0) {
            // Access denied
            return response.status(409).send({ status: 409, reason: 'The user is already an employee of this restaurant' });
          }

          // add new employee
          const employeeNumber = `emp${reqBody.restaurantId}${empRes.rows[0].userid}`;
          const empId = await client.query(
            'INSERT INTO public.restaurantemployee'
            + ' (userid, restaurantid, employeerole, employeenumber)'
            + ' VALUES ($1::integer, $2::integer, $3::text, $4::text)'
            + ' RETURNING employeeid',
            [
              empRes.rows[0].userid,
              reqBody.restaurantId,
              reqBody.role,
              employeeNumber
            ]
          );
          const emailData = {};
          emailData.email = email;
          emailData.role = role;
          employSignInEmail(emailData); // sends email
          reqBody.priviliges.forEach(async (right) => {
            await client.query(
              'INSERT INTO public.employeeaccessright (employeeid, permissionid)'
              + ' VALUES ($1::integer, $2::integer)',
              [empId.rows[0].employeeid, right]
            );
          });
          // commit changes and end transaction
          await client.query('COMMIT');

          const employees = await client.query(
            'SELECT person.userid, person.name, person.surname, person.email, person.profileimageurl, restaurantemployee.employeeid, restaurantemployee.employeerole, restaurantemployee.employeenumber FROM public.person'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.userid = person.userid'
            + ' WHERE restaurantemployee.restaurantid = $1::integer',
            [reqBody.restaurantId]
          );
          const employeeList = [];
          employees.rows.forEach((emp) => {
            const employee = {};
            employee.userId = emp.userid;
            employee.employeeId = emp.employeeid;
            employee.name = emp.name;
            employee.surname = emp.surname;
            employee.email = emp.email;
            employee.profileImage = emp.profileimageurl;
            employee.role = emp.employeerole;
            employee.employeeNumber = emp.employeenumber;
            employeeList.push(employee);
          });

          // return newly created category id
          return response.status(201).send({ employees: employeeList });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Add Employee]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  editEmployee: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'employeeId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'role')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'priviliges')
      || !Array.isArray(reqBody.priviliges)
      || Object.keys(reqBody).length !== 5) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if employee exists
          const cRes = await client.query(
            'SELECT restaurantId FROM public.restaurantemployee WHERE employeeid = $1::integer',
            [reqBody.employeeId]
          );

          if (cRes.rows.length === 0) {
            // employee does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check user permissions
          const permission = 'employees';
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

          // update employee info
          await client.query(
            'UPDATE public.restaurantemployee SET employeerole = $1::text'
            + ' WHERE employeeid = $2::integer',
            [
              reqBody.role,
              reqBody.employeeId
            ]
          );

          await client.query(
            'DELETE FROM employeeaccessright'
            + ' WHERE employeeid = $1::integer',
            [
              reqBody.employeeId
            ]
          );

          reqBody.priviliges.forEach(async (right) => {
            await client.query(
              'INSERT INTO public.employeeaccessright (employeeid, permissionid)'
              + ' VALUES ($1::integer, $2::integer)',
              [reqBody.employeeId, right]
            );
          });

          // commit changes and end transaction
          await client.query('COMMIT');

          const emp = await client.query(
            'SELECT person.userid, person.name, person.surname, person.email, person.profileimageurl, restaurantemployee.employeeid, restaurantemployee.employeerole, restaurantemployee.employeenumber FROM public.person'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.userid = person.userid'
            + ' WHERE restaurantemployee.employeeid = $1::integer',
            [reqBody.employeeId]
          );

          const employee = {};
          employee.userId = emp.rows[0].userid;
          employee.employeeId = emp.rows[0].employeeid;
          employee.name = emp.rows[0].name;
          employee.surname = emp.rows[0].surname;
          employee.email = emp.rows[0].email;
          employee.profileImage = emp.rows[0].profileimageurl;
          employee.role = emp.rows[0].employeerole;
          employee.employeeNumber = emp.rows[0].employeenumber;

          return response.status(201).send(employee);
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Edit Employee]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  removeEmployee: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'employeeId')
      || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if employee exists
          const cRes = await client.query(
            'SELECT restaurantId FROM public.restaurantemployee WHERE employeeid = $1::integer',
            [reqBody.employeeId]
          );

          if (cRes.rows.length === 0) {
            // employee does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check user permissions
          const permission = 'employees';
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

          // remove employee
          await client.query(
            'DELETE FROM employeeaccessright'
            + ' WHERE employeeid = $1::integer',
            [
              reqBody.employeeId
            ]
          );

          await client.query(
            'DELETE FROM restaurantemployee'
            + ' WHERE employeeid = $1::integer',
            [
              reqBody.employeeId
            ]
          );

          // commit changes and end transaction
          await client.query('COMMIT');

          return response.status(201).send({ status: 'Employee deleted' });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Remove Employee]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getAllAccessRights: (reqBody, response) => {
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

          // check if user is an employee of a resyaurant
          const permRes = await client.query(
            'SELECT employeeid FROM public.restaurantemployee WHERE userid = $1::integer',
            [userToken.data.userId]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          const permissionsRes = await client.query(
            'SELECT permissionid, description FROM public.accessright;'
          );

          const accessList = [];
          permissionsRes.rows.forEach((permission) => {
            const permissionObj = {};
            permissionObj.permissionId = permission.permissionid;
            permissionObj.description = permission.description;
            accessList.push(permissionObj);
          });

          // return newly created category id
          return response.status(201).send({ accessRights: accessList });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Add Employee]', err.stack);
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
        const client = await dbw.connect();
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
            + ' SET categoryname = $1::text, categorydescription = $2::text, categorytype = $3::text, parentcategoryid = $4::integer'
            + ' WHERE categoryId = $5::integer',
            [
              reqBody.categoryName,
              reqBody.categoryDescription,
              reqBody.categoryType,
              (reqBody.categoryType.toLowerCase() === 'secondary') ? reqBody.parentCategoryId : null,
              reqBody.categoryId
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
        const client = await dbw.connect();
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
        const client = await dbw.connect();
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
          await client.query(
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
              [reqBody.menuItemId, reqBody.images[i]]
            );
          }

          // commit changes and end transaction
          await client.query('COMMIT');

          const itemInfo = await client.query(
            'SELECT * FROM public.menuitem WHERE menuitemid = $1::integer',
            [reqBody.menuItemId]
          );

          const menuImage = await client.query(
            'SELECT imageurl FROM public.menuitemimages WHERE menuitemid = $1::integer ORDER BY imageid ASC;',
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
  },
  getRestaurantEmployees: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || Object.keys(reqBody).length !== 3) {
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
          const permission = 'employees';
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
          const employeeObj = {};
          const employeePromises = await getEmployees(reqBody.restaurantId);
          employeeObj.employees = [];

          Promise.all(employeePromises)
            .then((employeeItem) => {
              employeeItem.forEach((employee) => {
                employeeObj.employees.push(employee);
              });
              return response.status(201).send(employeeObj);
            })
            .catch((err) => {
              console.error('Employee Promise Error', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Add Employee]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  getEmployee: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'employeeId')
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

          // check if employee exists
          const cRes = await client.query(
            'SELECT userid, employeerole, restaurantid, employeenumber FROM public.restaurantemployee WHERE employeeid = $1::integer',
            [reqBody.employeeId]
          );

          if (cRes.rows.length === 0) {
            // employee does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          const userId = cRes.rows[0].userid;
          const restaurantId = cRes.rows[0].restaurantid;

          // check user permissions
          const permission = 'employees';
          const permRes = await client.query(
            'SELECT employeeaccessright.permissionid FROM public.employeeaccessright'
            + ' INNER JOIN public.accessright ON accessright.permissionid = employeeaccessright.permissionid'
            + ' INNER JOIN public.restaurantemployee ON restaurantemployee.employeeid = employeeaccessright.employeeid'
            + ' WHERE restaurantemployee.userid = $1::integer AND restaurantemployee.restaurantid = $2::integer AND LOWER(accessright.description) = $3::text',
            [userToken.data.userId, restaurantId, permission]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          const employeeRes = await client.query(
            'SELECT person.userid, person.name, person.surname, person.email, person.profileimageurl FROM public.person'
            + ' WHERE person.userid = $1::integer',
            [userId]
          );

          const employee = {};
          employee.userId = userId;
          employee.employeeId = reqBody.employeeId;
          employee.name = employeeRes.rows[0].name;
          employee.surname = employeeRes.rows[0].surname;
          employee.email = employeeRes.rows[0].email;
          employee.profileImage = employeeRes.rows[0].profileimageurl;
          employee.role = cRes.rows[0].employeerole;
          employee.employeeNumber = cRes.rows[0].employeenumber;
          employee.averageRating = await getAvgScore(userId, restaurantId);
          employee.reviews = [];
          employee.ratings = [];
          employee.orders = [];
          employee.rights = [];

          const reviewsPromises = await getEmployeeReviews(userId, restaurantId);

          await Promise.all(reviewsPromises)
            .then((reviewItem) => {
              reviewItem.forEach((review) => {
                employee.reviews.push(review);
              });
            });

          const ordersPromises = await getEmployeeOrders(userId, restaurantId);

          await Promise.all(ordersPromises)
            .then((orderItem) => {
              orderItem.forEach((order) => {
                employee.orders.push(order);
              });
            });

          const ratingsPromises = await getEmployeeRatings(userId, restaurantId);

          await Promise.all(ratingsPromises)
            .then((ratingItem) => {
              ratingItem.forEach((rating) => {
                employee.ratings.push(rating);
              });
            });

          const rightsPromises = await getEmployeeRights(reqBody.employeeId);

          await Promise.all(rightsPromises)
            .then((rightItem) => {
              rightItem.forEach((right) => {
                employee.rights.push(right);
              });
            });

          // return employee info
          return response.status(201).send(employee);
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Add Employee]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  addPromotion: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'restaurantId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'message')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'image')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'startDate')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'endDate')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'days')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'value')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'type')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'promotions')
      || Object.keys(reqBody).length !== 11) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await dbw.connect();
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

          // check if any menu items in promotion not in the restaurant
          // eslint-disable-next-line consistent-return
          for (let i = 0; i < reqBody.promotions.length; i++) {
            const promo = reqBody.promotions[i].items;
            for (let y = 0; y < promo.length; y++) {
              // eslint-disable-next-line no-await-in-loop
              const promoItem = await client.query(
                'SELECT menuitemid FROM public.menuitem'
                + ' INNER JOIN public.menucategory ON menucategory.categoryid = menuitem.categoryid'
                + ' WHERE menuitem.menuitemid = $1::integer and menucategory.restaurantid = $2::integer',
                [promo[y].itemId, reqBody.restaurantId]
              );

              if (promoItem.rows.length === 0) {
                // menu item does not exist in given restaurant
                return response.status(405).send({ status: 405, reason: 'Not Found' });
              }
            }
          }

          // insert new promotion
          const promoId = await client.query(
            'INSERT INTO public.promotion'
            + ' (restaurantid, promotionalmessage, promotionalimage, startdatetime, enddatetime, promotionvalue, promotiontype)'
            + ' VALUES ($1::integer, $2::text, $3::text, $4::timestamp, $5::timestamp, $6::real, $7::text)'
            + ' RETURNING promotionid',
            [
              reqBody.restaurantId,
              reqBody.message,
              reqBody.image,
              reqBody.startDate,
              reqBody.endDate,
              reqBody.value,
              reqBody.type
            ]
          );

          for (let i = 0; i < reqBody.days.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            const dayId = await client.query(
              'SELECT dayid FROM public.dayofweek WHERE description = $1::text',
              [reqBody.days[i]]
            );

            // eslint-disable-next-line no-await-in-loop
            await client.query(
              'INSERT INTO public.dayvalid (promotionid, dayid)'
              + ' VALUES ($1::integer, $2::integer)',
              [promoId.rows[0].promotionid, dayId.rows[0].dayid]
            );
          }

          for (let i = 0; i < reqBody.promotions.length; i++) {
            const promotion = reqBody.promotions[i].items;
            // eslint-disable-next-line no-await-in-loop
            const groupRes = await client.query(
              'INSERT INTO public.promogroup (promotionid)'
              + ' VALUES ($1::integer)'
              + ' RETURNING promogroupid',
              [promoId.rows[0].promotionid]
            );

            for (let y = 0; y < promotion.length; y++) {
              let attributeVal = null;
              let attributeId = null;
              if (Object.keys(promotion[y].attribute).length !== 0) {
                attributeVal = promotion[y].attribute.value;
                attributeId = promotion[y].attribute.attributeId;
              }
              // eslint-disable-next-line no-await-in-loop
              await client.query(
                'INSERT INTO public.promotionitem (promogroupid, menuitemid, attributeid, attributevalue)'
                + ' VALUES ($1::integer, $2::integer, $3::text, $4::text)',
                [groupRes.rows[0].promogroupid, promotion[y].itemId,
                  attributeId, attributeVal]
              );
            }
          }

          // commit changes and end transaction
          await client.query('COMMIT');

          // return newly created promotion id
          return response.status(201).send({ promotionId: promoId.rows[0].promotionid });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Add Promotion]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  editPromotion: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'promotionId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'message')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'image')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'startDate')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'endDate')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'days')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'value')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'type')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'promotions')
      || Object.keys(reqBody).length !== 11) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      return (async () => {
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if promotion exists
          const cRes = await client.query(
            'SELECT restaurantid FROM public.promotion WHERE promotionid = $1::integer',
            [reqBody.promotionId]
          );

          if (cRes.rows.length === 0) {
            // promotion does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check user permissions
          const requiredRole = 'admin';
          const permRes = await client.query(
            'SELECT employeerole FROM public.restaurantemployee'
            + ' WHERE userid = $1::integer AND restaurantid = $2::integer AND LOWER(employeerole) = $3::text',
            [userToken.data.userId, cRes.rows[0].restaurantid, requiredRole]
          );

          if (permRes.rows.length === 0) {
            // Access denied
            return response.status(403).send({ status: 403, reason: 'Access Denied' });
          }

          // check if any menu items in promotion not in the restaurant
          // eslint-disable-next-line consistent-return
          for (let i = 0; i < reqBody.promotions.length; i++) {
            const promo = reqBody.promotions[i].items;
            for (let y = 0; y < promo.length; y++) {
              // eslint-disable-next-line no-await-in-loop
              const promoItem = await client.query(
                'SELECT menuitemid FROM public.menuitem'
                + ' INNER JOIN public.menucategory ON menucategory.categoryid = menuitem.categoryid'
                + ' WHERE menuitem.menuitemid = $1::integer and menucategory.restaurantid = $2::integer',
                [promo[y].itemId, cRes.rows[0].restaurantid]
              );

              if (promoItem.rows.length === 0) {
                // menu item does not exist in given restaurant
                return response.status(405).send({ status: 405, reason: 'Not Found' });
              }
            }
          }

          // update promotion
          await client.query(
            'UPDATE public.promotion'
            + ' SET promotionalmessage = $1::text, promotionalimage = $2::text, startdatetime = $3::timestamp, enddatetime = $4::timestamp, promotionvalue = $5::real, promotiontype = $6::text'
            + ' WHERE promotionid = $7::integer',
            [
              reqBody.message,
              reqBody.image,
              reqBody.startDate,
              reqBody.endDate,
              reqBody.value,
              reqBody.type,
              reqBody.promotionId
            ]
          );

          await client.query(
            'DELETE FROM public.dayvalid WHERE promotionid = $1::integer',
            [reqBody.promotionId]
          );

          const promogroups = await client.query(
            'SELECT promogroupid FROM public.promogroup WHERE promotionid = $1::integer',
            [reqBody.promotionId]
          );

          promogroups.rows.forEach(async (group) => {
            await client.query(
              'DELETE FROM public.promotionitem WHERE promogroupid = $1::integer',
              [group.promogroupid]
            );
          });

          await client.query(
            'DELETE FROM public.promogroup WHERE promotionid = $1::integer',
            [reqBody.promotionId]
          );

          for (let i = 0; i < reqBody.days.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            const dayId = await client.query(
              'SELECT dayid FROM public.dayofweek WHERE description = $1::text',
              [reqBody.days[i]]
            );

            // eslint-disable-next-line no-await-in-loop
            await client.query(
              'INSERT INTO public.dayvalid (promotionid, dayid)'
              + ' VALUES ($1::integer, $2::integer)',
              [reqBody.promotionId, dayId.rows[0].dayid]
            );
          }

          for (let i = 0; i < reqBody.promotions.length; i++) {
            const promotion = reqBody.promotions[i].items;
            // eslint-disable-next-line no-await-in-loop
            const groupRes = await client.query(
              'INSERT INTO public.promogroup (promotionid)'
              + ' VALUES ($1::integer)'
              + ' RETURNING promogroupid',
              [reqBody.promotionId]
            );

            for (let y = 0; y < promotion.length; y++) {
              let attributeVal = null;
              let attributeId = null;
              if (Object.keys(promotion[y].attribute).length !== 0) {
                attributeVal = promotion[y].attribute.value;
                attributeId = promotion[y].attribute.attributeId;
              }

              // eslint-disable-next-line no-await-in-loop
              await client.query(
                'INSERT INTO public.promotionitem (promogroupid, menuitemid, attributeid, attributevalue)'
                + ' VALUES ($1::integer, $2::integer, $3::text, $4::text)',
                [groupRes.rows[0].promogroupid, promotion[y].itemId,
                  attributeId, attributeVal]
              );
            }
          }

          // commit changes and end transaction
          await client.query('COMMIT');

          // return newly created promotion id
          return response.status(201).send({ promotionId: reqBody.promotionId });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })()
        .catch((err) => {
          console.error('Query Error [Restaurant - Edit Promotion]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  replyToComment: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'reviewId')
      || !Object.prototype.hasOwnProperty.call(reqBody, 'response')
      || Object.keys(reqBody).length !== 4) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const userToken = validateToken(reqBody.token, true);

    if (userToken.state === tokenState.VALID) {
      // eslint-disable-next-line consistent-return
      return (async () => {
        const client = await dbw.connect();
        try {
          // begin transaction
          await client.query('BEGIN');

          // check if review exists
          const cRes = await client.query(
            'SELECT restauranttable.restaurantid, review.adminid FROM public.review'
            + ' INNER JOIN public.customerorder ON customerorder.orderid = review.orderid'
            + ' INNER JOIN public.restauranttable ON restauranttable.tableid = customerorder.tableid'
            + ' WHERE review.reviewid = $1::integer;',
            [reqBody.reviewId]
          );

          if (cRes.rows.length === 0) {
            // review does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // check user permissions
          const permission = 'reviews';
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

          // add response
          await client.query(
            'UPDATE public.review SET adminid = $1::integer, response = $2::text, responsedatetime = NOW()'
            + ' WHERE reviewid = $3::integer;',
            [userToken.data.userId, reqBody.response, reqBody.reviewId]
          );

          // commit changes and end transaction
          await client.query('COMMIT');

          const rRes = await client.query(
            'SELECT review.reviewid, review.comment, review.reviewdatetime, review.public, review.adminid, review.response, review.ratingscore, review.responsedatetime, customerorder.customerid'
            + ' FROM public.review'
            + ' INNER JOIN public.customerorder ON customerorder.orderid = review.orderid'
            + ' WHERE review.reviewid = $1::integer',
            [reqBody.reviewId]
          );

          const adminId = (rRes.rows[0].adminid === null) ? 0 : rRes.rows[0].adminid;

          const pRes = await client.query(
            'SELECT name, surname, profileimageurl FROM public.person WHERE userid IN ($1::integer, $2::integer);',
            [rRes.rows[0].customerid, adminId]
          );

          const reviewItem = {};
          reviewItem.reviewId = rRes.rows[0].reviewid;
          reviewItem.customerId = rRes.rows[0].customerid;
          reviewItem.customerName = pRes.rows[0].name;
          reviewItem.customerSurname = pRes.rows[0].surname;
          reviewItem.customerImage = pRes.rows[0].profileimageurl;
          reviewItem.ratingScore = rRes.rows[0].ratingscore;
          reviewItem.comment = rRes.rows[0].comment;
          reviewItem.reviewDateTime = rRes.rows[0].reviewdatetime;
          reviewItem.public = rRes.rows[0].public;
          reviewItem.adminName = (pRes.rows.length > 1) ? pRes.rows[1].name : null;
          reviewItem.adminSurname = (pRes.rows.length > 1) ? pRes.rows[1].surname : null;
          reviewItem.adminImage = (pRes.rows.length > 1) ? pRes.rows[1].profileimageurl : null;
          reviewItem.adminId = rRes.rows[0].adminid;
          reviewItem.response = rRes.rows[0].response;
          reviewItem.responseDate = rRes.rows[0].responsedatetime;

          return response.status(201).send(reviewItem);
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
};
