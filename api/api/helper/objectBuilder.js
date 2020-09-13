/* eslint-disable linebreak-style */
const db = require('../db');

// helper to get individual order items
const getOrderItems = async (oid = 0) => db.query(
  'SELECT menuitem.menuitemid, menuitem.menuitemname, menuitem.menuitemdescription,'
    + ' itemordered.itemtotal, itemordered.quantity, itemordered.orderselections,'
    + ' itemordered.progress FROM public.itemordered'
    + ' INNER JOIN public.menuitem ON menuitem.menuitemid = itemordered.menuitemid'
    + ' WHERE itemordered.orderid = $1::integer;',
  [oid]
)
  .then((orderItems) => {
    const orderHistoryItems = [];
    // let orderTotal = 0.0;
    orderItems.rows.forEach((ordItem) => {
      const orderItem = {};
      orderItem.menuItemId = ordItem.menuitemid;
      orderItem.menuItemName = ordItem.menuitemname;
      orderItem.menuItemDescription = ordItem.menuitemdescription;
      orderItem.itemTotal = ordItem.itemtotal;
      orderItem.quantity = ordItem.quantity;
      orderItem.progress = ordItem.progress;
      orderItem.orderselections = ordItem.orderselections;
      // orderTotal += ordItem.itemtotal;
      orderHistoryItems.push(orderItem);
    });
    return { items: orderHistoryItems };
  })
  .catch((err) => {
    console.error('Query Error [Order Helper - Get Order Items]', err.stack);
    return [];
  });

// helper to get individual menu items
// eslint-disable-next-line arrow-body-style
const getMenuItems = (categoryId = 0) => {
  return (async () => {
    const client = await db.connect();
    try {
    // begin transaction
      await client.query('BEGIN');

      const menuItems = await client.query(
        'SELECT menuitemid, menuitemname, menuitemdescription, price, estimatedwaitingtime,'
        + ' menuitem.attributes, arasset, availability FROM public.menuitem'
        + ' WHERE categoryid = $1::integer;',
        [categoryId]
      );

      const menuItemsArr = [];
      for (let mi = 0; mi < menuItems.rows.length; mi++) {
        const menuItem = {};
        const resMenuItem = menuItems.rows[mi];
        menuItem.menuItemId = resMenuItem.menuitemid;
        menuItem.menuItemName = resMenuItem.menuitemname;
        menuItem.menuItemDescription = resMenuItem.menuitemdescription;
        menuItem.price = resMenuItem.price;
        menuItem.estimatedWaitingTime = resMenuItem.estimatedwaitingtime;
        menuItem.images = [];
        menuItem.dietaryLabels = [];
        menuItem.attributes = resMenuItem.attributes;
        menuItem.arAsset = resMenuItem.arasset;
        menuItem.availability = resMenuItem.availability;

        // menu item images
        // eslint-disable-next-line no-await-in-loop
        const menuItemImages = await client.query(
          'SELECT imageurl FROM public.menuitemimages WHERE menuitemid = $1::integer',
          [resMenuItem.menuitemid]
        );

        menuItemImages.rows.forEach((menuImg) => {
          menuItem.images.push(menuImg.imageurl);
        });

        // menu item dietary labels
        // eslint-disable-next-line no-await-in-loop
        const menuItemDietaryLabels = await client.query(
          'SELECT dietaryInformation.name, dietaryInformation.abbreviation, dietaryInformation.image'
          + ' FROM public.menuitemdietarylabels'
          + ' INNER JOIN public.dietaryInformation ON dietaryInformation.id = menuitemdietarylabels.dietaryinfoid'
          + ' INNER JOIN public.menuitem ON menuitemdietarylabels.menuitemid = menuitem.menuitemid'
          + ' WHERE menuitem.menuitemid = $1::integer',
          [resMenuItem.menuitemid]
        );

        menuItemDietaryLabels.rows.forEach((menuLabel) => {
          const dietaryObj = {};
          dietaryObj.name = menuLabel.name;
          dietaryObj.abbreviation = menuLabel.abbreviation;
          dietaryObj.image = menuLabel.image;
          menuItem.dietaryLabels.push(dietaryObj);
        });

        // get menu item rating
        // eslint-disable-next-line no-await-in-loop
        const rtRes = await client.query(
          'SELECT AVG(ratingscore) AS "rating" FROM public.review'
          + ' WHERE menuitemid = $1::integer AND ratingscore IS NOT NULL;',
          [resMenuItem.menuitemid]
        );

        if (rtRes.rows.length === 0) {
          menuItem.rating = 0.0;
        } else {
          menuItem.rating = parseFloat(rtRes.rows[0].rating);
        }

        // get menu item reviews
        menuItem.reviews = [];
        // eslint-disable-next-line no-await-in-loop
        const revRes = await client.query(
          'SELECT review.reviewid, review.orderid, review.ratingscore, review.comment, review.reviewdatetime, review.public, review.adminid, review.response'
          + ' FROM public.review WHERE review.menuitemid = $1::integer AND review.comment IS NOT NULL;',
          [resMenuItem.menuitemid]
        );

        revRes.rows.forEach(async (review) => {
          const reviewItem = {};
          reviewItem.reviewId = review.reviewid;

          const orderIdRes = await client.query(
            'SELECT customerorder.customerid'
            + ' FROM public.customerorder WHERE customerorder.orderid = $1::integer',
            [review.orderid]
          );

          if (orderIdRes.rows.length !== 0) {
            const customerInfoRes = await client.query(
              'SELECT person.name, person.surname, person.profileimageurl'
              + ' FROM public.person WHERE person.userid = $1::integer',
              [orderIdRes.rows[0].customerid]
            );

            if (customerInfoRes.rows.length !== 0) {
              reviewItem.customerName = customerInfoRes.rows[0].name;
              reviewItem.customerSurname = customerInfoRes.rows[0].surname;
              reviewItem.customerImage = customerInfoRes.rows[0].profileimageurl;
            }

            reviewItem.ratingScore = review.ratingscore;
            reviewItem.comment = review.comment;
            reviewItem.reviewDateTime = review.reviewdatetime;
            reviewItem.public = review.public;

            const numLikesRes = await client.query(
              'SELECT COUNT(userid) as "numLikes"'
              + ' FROM public.likedreview WHERE likedreview.reviewid = $1::integer',
              [review.reviewid]
            );

            if (numLikesRes.rows.length !== 0) {
              reviewItem.totalLikes = numLikesRes.rows[0].numLikes;
            } else {
              reviewItem.totalLikes = 0;
            }

            // const likedRevRes = await client.query(
            //   'SELECT *'
            //   + ' FROM public.likedreview WHERE likedreview.userid = $1::integer'
            //   + ' AND likedreview.reviewid = $2::integer',
            //   [userId, review.reviewid]
            // );

            // if (likedRevRes.rows.length !== 0) {
            //   reviewItem.likedComment = true;
            // } else {
            //   reviewItem.likedComment = false;
            // }

            if (review.adminId != null) {
              const adminInfoRes = await client.query(
                'SELECT person.name, person.surname, person.profileimageurl'
                + ' FROM public.person WHERE person.userid = $1::integer',
                [review.adminId]
              );

              if (adminInfoRes.rows.length !== 0) {
                reviewItem.adminName = adminInfoRes.rows[0].name;
                reviewItem.adminSurname = adminInfoRes.rows[0].surname;
                reviewItem.adminImage = adminInfoRes.rows[0].profileimageurl;
              }
            } else {
              reviewItem.adminName = null;
              reviewItem.adminSurname = null;
              reviewItem.adminImage = null;
            }
            reviewItem.response = review.response;
          }
          menuItem.reviews.push(reviewItem);
        });

        // get rating phrases
        menuItem.ratingPhrases = [];
        // eslint-disable-next-line no-await-in-loop
        const rpRes = await client.query(
          'SELECT ratingphrase.phrasedescription, AVG(customerphraserating.ratingscore) AS "rating"'
          + ' FROM public.customerphraserating'
          + ' INNER JOIN public.ratingphrase ON ratingphrase.phraseid = customerphraserating.phraseid'
          + ' INNER JOIN public.review ON customerphraserating.reviewid = review.reviewid'
          + " WHERE review.menuitemid = $1::integer AND LOWER(ratingphrase.type) = 'item'"
          + ' GROUP BY ratingphrase.phrasedescription;',
          [resMenuItem.menuitemid]
        );

        rpRes.rows.forEach((ratePhrase) => {
          const ratingphraseItem = {};
          ratingphraseItem.phrase = ratePhrase.phrasedescription;
          ratingphraseItem.rating = ratePhrase.rating;
          menuItem.ratingPhrases.push(ratingphraseItem);
        });

        // add to menu items array
        menuItemsArr.push(menuItem);
      }

      // commit change
      await client.query('COMMIT');

      // return menu items
      return { menuItemsArr };
    } catch (err) {
    // rollback changes
      await client.query('ROLLBACK');

      // throw error for async catch
      throw err;
    } finally {
      client.release();
    }
  })()
    .catch((err) => {
      console.error('Query Error [Menu Helper - Get Menu Items]', err.stack);
      return [];
    });
};

module.exports = {
  getFavourites: (userId = 0) => (async () => {
    const client = await db.connect();
    try {
      // begin transaction
      await client.query('BEGIN');
      const res = await client.query(
        'SELECT menuitem.menuitemid, menuitem.menuitemname, menuitem.menuitemdescription,'
          + ' restaurant.restaurantid, restaurant.restaurantname FROM public.menuitem'
          + ' INNER JOIN public.restaurant ON menuitem.restaurantid = restaurant.restaurantid'
          + ' INNER JOIN public.favourite ON menuitem.menuitemid = favourite.menuitemid'
          + ' WHERE favourite.userid = $1::integer;',
        [userId]
      );

      const favouritesArr = [];
      for (let f = 0; f < res.rows.length; f++) {
        const favItem = {};
        favItem.restaurantId = res.rows[f].restaurantid;
        favItem.restaurantName = res.rows[f].restaurantname;
        favItem.menuItemId = res.rows[f].menuitemid;
        favItem.menuItemName = res.rows[f].menuitemname;
        favItem.menuItemDescription = res.rows[f].menuitemdescription;
        favItem.images = [];

        // menu item images
        // eslint-disable-next-line no-await-in-loop
        const menuItemImages = await client.query(
          'SELECT imageurl FROM public.menuitemimages WHERE menuitemid = $1::integer',
          [res.rows[f].menuitemid]
        );

        menuItemImages.rows.forEach((menuImg) => {
          favItem.images.push(menuImg.imageurl);
        });

        favouritesArr.push(favItem);
      }

      // commit and return favourites array
      await client.query('COMMIT');
      return favouritesArr;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  })()
    .catch((err) => {
      console.error('Query Error [Favourites - Get User Favourites]', err.stack);
      return [];
    }),
  getOrderItems,
  getOrderHistory: (userId = 0) => db.query(
    'SELECT customerorder.orderid, restaurant.restaurantid, restaurant.restaurantname,'
    + ' restaurant.location, customerorder.orderdatetime, customerorder.ordercompletiontime,'
    + ' customerorder.orderstatus, customerorder.progress, customerorder.waitertip, customerorder.ordertotal,'
    + ' customerorder.ordernumber, person.name AS "ename", person.surname AS "esurname"'
    + ' FROM public.customerorder'
    + ' INNER JOIN public.restauranttable ON customerorder.tableid = restauranttable.tableid'
    + ' INNER JOIN public.restaurant ON restauranttable.restaurantid = restaurant.restaurantid'
    + ' INNER JOIN public.person ON customerorder.employeeid = person.userid'
    + ' WHERE customerorder.customerid = $1::integer;',
    [userId]
  )
    .then((res) => {
      const orderHistoryPromises = [];
      res.rows.forEach((hist) => {
        orderHistoryPromises.push(getOrderItems(hist.orderid)
          .then((orderItems) => {
            const historyItem = {};
            historyItem.orderId = hist.orderid;
            historyItem.orderNumber = hist.ordernumber;
            historyItem.restaurantId = hist.restaurantid;
            historyItem.restaurantName = hist.restaurantname;
            historyItem.restaurantLocation = hist.location;
            historyItem.orderDateTime = hist.orderdatetime;
            historyItem.orderCompletionTime = hist.ordercompletiontime;
            historyItem.orderStatus = hist.orderstatus;
            historyItem.progress = hist.progress;
            // historyItem.total = orderItems.orderTotal;
            historyItem.waiterTip = hist.waitertip;
            historyItem.total = hist.ordertotal;
            historyItem.orderEmployeeName = hist.ename;
            historyItem.orderEmployeeSurname = hist.esurname;
            historyItem.items = orderItems.items;
            return historyItem;
          }));
      });
      return orderHistoryPromises;
    })
    .catch((err) => {
      console.error('Query Error [Order History - Get User Order History]', err.stack);
      return Promise.reject(err);
    }),
  getReviews: (restaurantId = 0) => db.query(
    'SELECT review.comment, review.reviewdatetime, review.public, review.adminid, review.response'
    + ' FROM public.review WHERE review.restaurantid = $1::integer AND review.comment IS NOT NULL;',
    [restaurantId]
  )
    .then((res) => {
      const reviewsArr = [];
      res.rows.forEach((review) => {
        const reviewItem = {};
        reviewItem.comment = review.comment;
        reviewItem.reviewDateTime = review.reviewdatetime;
        reviewItem.public = review.public;
        reviewItem.adminId = review.adminid;
        reviewItem.response = review.response;
        reviewsArr.push(reviewItem);
      });
      return reviewsArr;
    })
    .catch((err) => {
      console.error('Query Error [Reviews - Get Restaurant Reviews]', err.stack);
      return [];
    }),
  getRatingPhrasesObj: (restaurantId = 0) => db.query(
    'SELECT ratingphrase.phrasedescription, AVG(customerphraserating.ratingscore) AS "rating"'
    + ' FROM public.customerphraserating'
    + ' INNER JOIN public.ratingphrase ON ratingphrase.phraseid = customerphraserating.phraseid'
    + ' INNER JOIN public.review ON customerphraserating.reviewid = review.reviewid'
    + " WHERE review.restaurantid = $1::integer AND (LOWER(ratingphrase.type) = 'restaurant'"
    + " OR LOWER(ratingphrase.type) = 'waiter' OR LOWER(ratingphrase.type) = 'waitress')"
    + ' GROUP BY ratingphrase.phrasedescription;',
    [restaurantId]
  )
    .then((res) => {
      const ratingPhrassesArr = [];
      res.rows.forEach((ratePhrase) => {
        const ratingphraseItem = {};
        ratingphraseItem.phrase = ratePhrase.phrasedescription;
        ratingphraseItem.rating = ratePhrase.rating;
        ratingPhrassesArr.push(ratingphraseItem);
      });
      return ratingPhrassesArr;
    })
    .catch((err) => {
      console.error('Query Error [Rating Phrases - Get Restaurant Ratings]', err.stack);
      return [];
    }),
  getMenuCategories: (restaurantId = 0) => (async () => {
    const client = await db.connect();
    try {
      // begin transaction
      await client.query('BEGIN');

      // get menu categories
      const res = await client.query(
        'SELECT categoryid, categoryname, categorydescription, parentcategoryid, categorytype'
          + ' FROM public.menucategory'
          + ' WHERE restaurantid = $1::integer;',
        [restaurantId]
      );

      const categoriesRes = [];

      for (let r = 0; r < res.rows.length; r++) {
        const categoryItem = {};
        // eslint-disable-next-line no-await-in-loop
        const resMenuItem = await getMenuItems(res.rows[r].categoryid);
        categoryItem.categoryId = res.rows[r].categoryid;
        categoryItem.categoryName = res.rows[r].categoryname;
        categoryItem.description = res.rows[r].categorydescription;
        categoryItem.parentCategoryId = res.rows[r].parentcategoryid;
        categoryItem.type = res.rows[r].categorytype;
        categoryItem.menuItems = resMenuItem.menuItemsArr;
        categoriesRes.push(categoryItem);
      }

      // commit cahnges
      await client.query('COMMIT');
      return categoriesRes;
    } catch (err) {
      // rollback changes
      await client.query('ROLLBACK');

      // throw error for async catch
      throw err;
    } finally {
      client.release();
    }
  })()
    .catch((err) => {
      console.error('Query Error [Categories - Get Restaurant Menu Categories]', err.stack);
      return [];
    })
};
