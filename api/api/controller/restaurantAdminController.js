const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { validateToken, tokenState } = require('../helper/tokenHandler');
/*
const {
  getReviews,
  getRatingPhrasesObj,
  getMenuCategories,
  getOrderHistory,
  getOrderItems
} = require('../helper/objectBuilder');
*/

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

          // create table
          const qrcode = uuidv4().replace(/-/g, ''); // UUID v4 without dashes (10^-37 collison rate)
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
  }
};
