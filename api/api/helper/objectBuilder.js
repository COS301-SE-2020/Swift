/* eslint-disable linebreak-style */
const db = require('../db').poolr;
// const dbw = require('../db').poolw;

// helper to get individual order items
const getOrderItems = async (oid = 0) => db.query(
  'SELECT menuitem.menuitemid, menuitem.menuitemname, menuitem.menuitemdescription,'
    + ' itemordered.itemtotal, itemordered.promoprice, itemordered.quantity, itemordered.orderselections,'
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
      orderItem.promoPrice = ordItem.promoprice;
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

const getOrderItemStatus = async (oid = 0) => db.query(
  'SELECT menuitemid, progress FROM public.itemordered'
    + ' WHERE orderid = $1::integer',
  [oid]
)
  .then((orderItems) => {
    const orderStatuses = [];
    orderItems.rows.forEach((order) => {
      const singleItem = {};
      singleItem.menuItemId = order.menuitemid;
      singleItem.progress = order.progress;
      orderStatuses.push(singleItem);
    });
    return { items: orderStatuses };
  })
  .catch((err) => {
    console.error('Query Error [Order Helper - Get Order Item Status]', err.stack);
    return [];
  });

const getAvgScore = (employeeid, restaurantId = 0) => db.query(
  'SELECT AVG(review.ratingscore) AS "score" FROM public.review'
  + ' INNER JOIN public.customerorder ON customerorder.orderid = review.orderid'
  + ' INNER JOIN public.restauranttable ON restauranttable.tableid = customerorder.tableid'
  + ' WHERE customerorder.employeeid = $1::integer AND restauranttable.restaurantid = $2::integer AND review.employeeid IS NOT NULL',
  [employeeid, restaurantId]
).then((scoreRes) => {
  const score = (scoreRes.rows.length !== 0 && scoreRes.rows[0].score !== null)
    ? parseFloat(scoreRes.rows[0].score.toFixed(2), 10) : 0;
  return score;
})
  .catch((err) => {
    console.error('Query Error [Score - Get Avergae Employee Score]', err.stack);
    return [];
  });

const getUserInfo = async (pid, adminId = 0) => db.query(
  'SELECT name, surname, profileimageurl'
    + ' FROM public.person WHERE person.userid IN ($1::integer, $2::integer)',
  [pid, adminId]
)
  .then((reviewerInfoRes) => {
    const reviewItem = {};
    reviewItem.customerName = reviewerInfoRes.rows[0].name;
    reviewItem.customerSurname = reviewerInfoRes.rows[0].surname;
    reviewItem.customerImage = reviewerInfoRes.rows[0].profileimageurl;
    if (reviewerInfoRes.rows.length > 1) {
      reviewItem.adminName = reviewerInfoRes.rows[1].name;
      reviewItem.adminSurname = reviewerInfoRes.rows[1].surname;
      reviewItem.adminImage = reviewerInfoRes.rows[1].profileimageurl;
    } else {
      reviewItem.adminName = null;
      reviewItem.adminSurname = null;
      reviewItem.adminImage = null;
    }
    return reviewItem;
  })
  .catch((err) => {
    console.error('Query Error [Order Helper - Get Order Items]', err.stack);
    return [];
  });
const getRatings = async (reviewid = 0) => db.query(
  'SELECT customerphraserating.ratingscore, customerphraserating.phraseid, ratingphrase.phrasedescription FROM public.customerphraserating'
  + ' INNER JOIN public.ratingphrase ON ratingphrase.phraseid = customerphraserating.phraseid'
  + ' WHERE customerphraserating.reviewid = $1::integer',
  [reviewid]
)
  .then((res) => {
    const ratingsArr = [];
    res.rows.forEach((rating) => {
      const ratingItem = {};
      ratingItem.phraseId = rating.phraseid;
      ratingItem.ratingScore = rating.ratingscore;
      ratingItem.description = rating.phrasedescription;

      ratingsArr.push(ratingItem);
    });
    return ratingsArr;
  })
  .catch((err) => {
    console.error('Query Error [Ratings - Get Phrase Ratings]', err.stack);
    return [];
  });

const getRatingInfo = async (phraseid = 0, employeeid, restaurantid) => db.query(
  'SELECT AVG(customerphraserating.ratingscore) AS "score" FROM customerphraserating'
  + ' INNER JOIN public.review ON review.reviewid = customerphraserating.reviewid'
  + ' INNER JOIN public.customerorder ON customerorder.orderid = review.orderid'
  + ' INNER JOIN public.restauranttable ON restauranttable.tableid = customerorder.tableid'
  + ' WHERE customerphraserating.phraseid = $1::integer AND customerorder.employeeid = $2::integer AND restauranttable.restaurantid = $3::integer',
  [phraseid, employeeid, restaurantid]
)
  .then((res) => {
    const ratingItem = {};
    ratingItem.score = (res.rows[0].score !== null)
      ? parseFloat(res.rows[0].score.toFixed(2), 10) : 0;
    return ratingItem;
  })
  .catch((err) => {
    console.error('Query Error [Ratings - Get Phrase Rating Score]', err.stack);
    return [];
  });

const getPromotionItems = async (pid) => db.query(
  'SELECT * FROM public.promotionitem'
  + ' WHERE promogroupid = $1::integer',
  [pid]
)
  .then((items) => {
    const promoItems = [];
    items.rows.forEach((item) => {
      const itemObj = {};
      itemObj.itemId = item.menuitemid;
      itemObj.attributeId = item.attributeid;
      itemObj.attributeVal = item.attributevalue;
      promoItems.push(itemObj);
    });
    return promoItems;
  })
  .catch((err) => {
    console.error('Query Error [Promotion Helper - Get Promotion Items]', err.stack);
    return [];
  });

const getEmployeeRights = async (employeeId = 0) => db.query(
  'SELECT accessright.description FROM public.employeeaccessright'
  + ' INNER JOIN public.accessright ON accessright.permissionid = employeeaccessright.permissionid'
  + ' WHERE employeeid = $1::integer',
  [employeeId]

).then((employees) => {
  const permissions = [];
  employees.rows.forEach((permission) => {
    permissions.push(permission.description);
  });
  return permissions;
})
  .catch((err) => {
    console.error('Query Error [Permissions - Get Employee Permissions]', err.stack);
    return [];
  });

const getPromotionGroups = async (promotionId) => db.query(
  'SELECT * FROM public.promogroup'
  + ' WHERE promogroup.promotionid = $1::integer',
  [promotionId]
)
  .then((res) => {
    const promotionPromises = [];
    res.rows.forEach((promotion) => {
      promotionPromises.push(getPromotionItems(promotion.promogroupid)
        .then((promoItems) => {
          const promotionItem = {};
          promotionItem.items = [];
          promoItems.forEach((item) => {
            promotionItem.items.push(item);
          });
          // eslint-disable-next-line no-console
          // console.log(promotionItem);
          return promotionItem;
        }));
    });
    // eslint-disable-next-line no-console
    // console.log(promotionPromises);
    return promotionPromises;
  })
  .catch((err) => {
    console.error('Query Error [Promotions - Get Restaurant Promotions]', err.stack);
    return Promise.reject(err);
  });

const getPromoDays = async (promotionId) => db.query(
  'SELECT dayofweek.description, dayOfWeek.dayid FROM public.dayofweek'
  + ' INNER JOIN public.dayvalid ON dayvalid.dayid = dayofweek.dayid'
  + ' INNER JOIN public.promotion ON promotion.promotionid = dayvalid.promotionid'
  + ' WHERE dayvalid.promotionid = $1::integer',
  [promotionId]
)
  .then(async (res) => {
    // const promotionItem = {};
    // promotionItem.promotions = [];
    const days = [];
    res.rows.forEach((day) => {
      days.push(day.description);
    });
    return days;
  })
  .catch((err) => {
    console.error('Query Error [Promotions - Get Restaurant Promotions]', err.stack);
    return Promise.reject(err);
  });

// helper to get individual menu items
// eslint-disable-next-line arrow-body-style
const getMenuItems = (categoryId) => {
  return (async () => {
    const client = await db.connect();
    try {
    // begin transaction
      await client.query('BEGIN');

      const restId = await client.query(
        'SELECT restaurantid FROM menucategory WHERE categoryid = $1::integer;',
        [categoryId]
      );

      const menuItems = await client.query(
        'SELECT menuitem.menuitemid, menuitem.menuitemname, menuitem.menuitemdescription,'
        + ' menuitem.price, menuitem.estimatedwaitingtime, menuitem.attributes, arasset, availability FROM public.menuitem'
        + ' WHERE categoryid = $1::integer ORDER BY menuitemid ASC;',
        [categoryId]
      );

      const mostPopular = await client.query(
        'SELECT sum(itemordered.quantity) as "quant" from public.itemordered'
        + ' INNER JOIN public.menuitem ON menuitem.menuitemid = itemordered.menuitemid'
        + ' INNER JOIN public.menucategory ON menucategory.categoryid = menuitem.categoryid'
        + ' WHERE menucategory.restaurantid = $1::integer'
        + ' GROUP BY itemordered.menuitemid ORDER BY sum(itemordered.quantity) DESC limit 1',
        [restId.rows[0].restaurantid]
      );

      const menuItemsArr = [];
      for (let mi = 0; mi < menuItems.rows.length; mi++) {
        const menuItem = {};
        const resMenuItem = menuItems.rows[mi];

        // eslint-disable-next-line no-await-in-loop
        const popularity = await client.query(
          'SELECT sum(itemordered.quantity) as "popularity" FROM public.itemordered'
          + ' WHERE menuitemid = $1::integer',
          [resMenuItem.menuitemid]
        );

        const itemQuantity = (popularity.rows.length !== 0) ? popularity.rows[0].popularity : 0;

        menuItem.menuItemId = resMenuItem.menuitemid;
        menuItem.menuItemName = resMenuItem.menuitemname;
        menuItem.menuItemDescription = resMenuItem.menuitemdescription;
        menuItem.price = resMenuItem.price;
        menuItem.popularity = (mostPopular.rows.length !== 0 && mostPopular.rows[0].quant !== 0)
          ? parseFloat(((itemQuantity / mostPopular.rows[0].quant) * 100).toFixed(2), 10)
          : 0;
        menuItem.estimatedWaitingTime = resMenuItem.estimatedwaitingtime;
        menuItem.images = [];
        menuItem.dietaryLabels = [];
        menuItem.attributes = resMenuItem.attributes;
        menuItem.arAsset = resMenuItem.arasset;
        menuItem.availability = resMenuItem.availability;

        // menu item images
        // eslint-disable-next-line no-await-in-loop
        const menuItemImages = await client.query(
          'SELECT imageurl FROM public.menuitemimages WHERE menuitemid = $1::integer ORDER BY imageid ASC',
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
          'SELECT AVG(ratingscore) AS "rating", COUNT(ratingscore) AS "numRated" FROM public.review'
          + ' WHERE menuitemid = $1::integer AND ratingscore IS NOT NULL;',
          [resMenuItem.menuitemid]
        );

        if (rtRes.rows.length === 0) {
          menuItem.rating = 0.0;
          menuItem.numRated = 0;
        } else {
          menuItem.rating = parseFloat(rtRes.rows[0].rating);
          menuItem.numRated = parseFloat(rtRes.rows[0].numRated);
        }

        // get menu item reviews
        menuItem.reviews = [];
        // eslint-disable-next-line no-await-in-loop
        const revRes = await client.query(
          'SELECT *'
          + ' FROM public.review WHERE review.menuitemid = $1::integer AND review.comment IS NOT NULL ORDER BY review.reviewid ASC;',
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

            reviewItem.customerId = orderIdRes.rows[0].customerid;

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

            // if (userId !== 0) {
            //   const likedRevRes = await client.query(
            //     'SELECT *'
            //     + ' FROM public.likedreview WHERE likedreview.userid = $1::integer'
            //     + ' AND likedreview.reviewid = $2::integer',
            //     [userId, review.reviewid]
            //   );

            //   if (likedRevRes.rows.length !== 0) {
            //     reviewItem.likedComment = true;
            //   } else {
            //     reviewItem.likedComment = false;
            //   }
            // }

            reviewItem.adminId = review.adminid;

            if (review.adminid != null) {
              const adminInfoRes = await client.query(
                'SELECT person.name, person.surname, person.profileimageurl'
                + ' FROM public.person WHERE person.userid = $1::integer',
                [review.adminid]
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
            reviewItem.responseDate = review.responsedatetime;
          }
          menuItem.reviews.push(reviewItem);
        });

        // get rating phrases
        menuItem.ratingPhrases = [];
        // eslint-disable-next-line no-await-in-loop
        const rpRes = await client.query(
          'SELECT ratingphrase.phraseid, ratingphrase.phrasedescription, AVG(customerphraserating.ratingscore) AS "rating", COUNT(customerphraserating.ratingscore) AS "numRated"'
          + ' FROM public.customerphraserating'
          + ' INNER JOIN public.ratingphrase ON ratingphrase.phraseid = customerphraserating.phraseid'
          + ' INNER JOIN public.review ON customerphraserating.reviewid = review.reviewid'
          + " WHERE review.menuitemid = $1::integer AND LOWER(ratingphrase.type) = 'item'"
          + ' GROUP BY ratingphrase.phraseid;',
          [resMenuItem.menuitemid]
        );

        rpRes.rows.forEach((ratePhrase) => {
          const ratingphraseItem = {};
          ratingphraseItem.phraseId = ratePhrase.phraseid;
          ratingphraseItem.phrase = ratePhrase.phrasedescription;
          ratingphraseItem.rating = ratePhrase.rating;
          ratingphraseItem.numRated = ratePhrase.numRated;
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
          'SELECT imageurl FROM public.menuitemimages WHERE menuitemid = $1::integer ORDER BY imageid ASC;',
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
  getLikedComments: (userId = 0) => (async () => {
    const client = await db.connect();
    try {
      // begin transaction
      await client.query('BEGIN');
      const res = await client.query(
        'SELECT reviewid FROM public.likedreview'
          + ' WHERE userid = $1::integer;',
        [userId]
      );

      const reviews = [];
      for (let f = 0; f < res.rows.length; f++) {
        reviews.push(res.rows[f].reviewid);
      }

      // commit and return liked reviews array
      await client.query('COMMIT');
      return reviews;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  })()
    .catch((err) => {
      console.error('Query Error [Liked Reviews - Get User Liked Reviews]', err.stack);
      return [];
    }),
  getEmployeeData: (userId = 0) => (async () => {
    const client = await db.connect();
    try {
      // begin transaction
      await client.query('BEGIN');
      const res = await client.query(
        'SELECT restaurantemployee.employeeid, restaurantemployee.restaurantid, restaurantemployee.employeerole,'
          + ' restaurantemployee.employeenumber FROM public.restaurantemployee'
          + ' WHERE restaurantemployee.userid = $1::integer;',
        [userId]
      );

      const employeeInfo = [];
      res.rows.forEach((emp) => {
        employeeInfo.push(getAvgScore(emp.userid, emp.restaurantid)
          .then(async (score) => {
            const employee = {};
            employee.restaurantId = emp.restaurantid;
            employee.employeeId = emp.employeeid;
            employee.role = emp.employeerole;
            employee.employeeNumber = emp.employeenumber;
            employee.averageRating = score;

            const accessRightPromises = await getEmployeeRights(emp.employeeid);
            employee.rights = [];

            await Promise.all(accessRightPromises)
              .then((accessItem) => {
                accessItem.forEach((access) => {
                  employee.rights.push(access);
                });
              });
            // eslint-disable-next-line no-console
            console.log(employee);
            return employee;
          }));
      });
      // commit and return favourites array
      await client.query('COMMIT');
      return employeeInfo;
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
    + ' WHERE customerorder.customerid = $1::integer ORDER BY customerorder.orderdatetime DESC;',
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
  getOrderItemStatus,
  getOrderStatuses: () => db.query(
    'SELECT orderid, orderstatus, progress FROM public.customerorder WHERE progress < 100;'
  )
    .then((res) => {
      const orderItemPromises = [];
      res.rows.forEach((order) => {
        orderItemPromises.push(getOrderItemStatus(order.orderid)
          .then((itemStatus) => {
            const orderObj = {};
            orderObj.orderId = order.orderid;
            orderObj.orderStatus = order.orderstatus;
            orderObj.orderProgress = order.progress;
            orderObj.itemProgress = itemStatus.items;
            return orderObj;
          }));
      });
      return orderItemPromises;
    })
    .catch((err) => {
      console.error('Query Error [Order Status - Get Order Status]', err.stack);
      return Promise.reject(err);
    }),
  getReviews: (restaurantId = 0) => db.query(
    'SELECT review.reviewid, review.comment, review.reviewdatetime, review.public, review.adminid, review.response, review.ratingscore, review.responsedatetime, customerorder.customerid FROM public.review'
    + ' INNER JOIN public.customerorder ON customerorder.orderid = review.orderid'
    + ' WHERE review.restaurantid = $1::integer AND review.comment IS NOT NULL ORDER BY reviewid DESC;',
    [restaurantId]
  )
    .then((res) => {
      const reviewsArr = [];
      res.rows.forEach((review) => {
        reviewsArr.push(getUserInfo(review.customerid, review.adminid)
          .then((reviewer) => {
            const reviewItem = {};
            reviewItem.reviewId = review.reviewid;
            reviewItem.customerId = review.customerid;
            reviewItem.customerName = reviewer.customerName;
            reviewItem.customerSurname = reviewer.customerSurname;
            reviewItem.customerImage = reviewer.customerImage;
            reviewItem.ratingScore = review.ratingscore;
            reviewItem.comment = review.comment;
            reviewItem.reviewDateTime = review.reviewdatetime;
            reviewItem.public = review.public;
            reviewItem.adminName = reviewer.adminName;
            reviewItem.adminSurname = reviewer.adminSurname;
            reviewItem.adminImage = reviewer.adminImage;
            reviewItem.adminId = review.adminid;
            reviewItem.response = review.response;
            reviewItem.responseDate = review.responsedatetime;
            return reviewItem;
          }));
      });
      return reviewsArr;
    })
    .catch((err) => {
      console.error('Query Error [Reviews - Get Restaurant Reviews]', err.stack);
      return [];
    }),
  getEmployeeReviews: (employeeid = 0, restaurantid) => db.query(
    'SELECT customerorder.customerid, review.reviewid, review.ratingscore, review.reviewdatetime, review.comment, review.public, review.adminid, review.response, review.responsedatetime FROM public.review'
    + ' INNER JOIN public.customerorder ON customerorder.orderid = review.orderid'
    + ' INNER JOIN public.restauranttable ON restauranttable.tableid = customerorder.tableid'
    + ' WHERE review.employeeid = $1::integer AND restauranttable.restaurantId = $2::integer',
    [employeeid, restaurantid]
  )
    .then((res) => {
      const reviewsArr = [];
      res.rows.forEach((review) => {
        reviewsArr.push(getUserInfo(review.customerid, review.adminid)
          .then(async (reviewer) => {
            const reviewItem = {};
            reviewItem.reviewId = review.reviewid;
            reviewItem.customerId = review.customerid;
            reviewItem.customerName = reviewer.customerName;
            reviewItem.customerSurname = reviewer.customerSurname;
            reviewItem.customerImage = reviewer.customerImage;
            reviewItem.ratingScore = review.ratingscore;
            reviewItem.comment = review.comment;
            reviewItem.reviewDateTime = review.reviewdatetime;
            reviewItem.public = review.public;
            reviewItem.adminName = reviewer.adminName;
            reviewItem.adminSurname = reviewer.adminSurname;
            reviewItem.adminImage = reviewer.adminImage;
            reviewItem.adminId = review.adminid;
            reviewItem.response = review.response;
            reviewItem.responseDate = review.responsedatetime;
            reviewItem.ratings = await getRatings(review.reviewid);
            return reviewItem;
          }));
      });
      return reviewsArr;
    })
    .catch((err) => {
      console.error('Query Error [Reviews - Get Employee Reviews]', err.stack);
      return [];
    }),
  getEmployeeRatings: (employeeid = 0, restaurantid) => db.query(
    "SELECT * FROM public.ratingphrase WHERE LOWER(ratingphrase.type) = 'waiter';"
  )
    .then((res) => {
      const ratingsArr = [];
      res.rows.forEach((rating) => {
        ratingsArr.push(getRatingInfo(rating.phraseid, employeeid, restaurantid)
          .then((info) => {
            const ratingItem = {};
            ratingItem.phraseId = rating.phraseid;
            ratingItem.description = rating.phrasedescription;
            ratingItem.score = info.score;
            return ratingItem;
          }));
      });
      return ratingsArr;
    })
    .catch((err) => {
      console.error('Query Error [Ratings - Get Employee Ratings...]', err.stack);
      return [];
    }),
  getEmployeeOrders: (employeeid = 0, restaurantid) => db.query(
    'SELECT customerorder.orderid, customerorder.customerid, customerorder.ordernumber, customerorder.orderdatetime, '
    + ' customerorder.ordercompletiontime, customerorder.orderstatus, customerorder.progress, customerorder.waitertip FROM public.customerorder'
    + ' INNER JOIN public.restauranttable ON restauranttable.tableid = customerorder.tableid'
    + ' WHERE customerorder.employeeid = $1::integer AND restauranttable.restaurantid = $2::integer',
    [employeeid, restaurantid]
  )
    .then((res) => {
      const reviewsArr = [];
      res.rows.forEach((order) => {
        reviewsArr.push(getOrderItems(order.orderid)
          .then(async (items) => {
            const orderObj = {};
            const customer = await getUserInfo(order.customerid);
            orderObj.orderId = order.orderid;
            orderObj.customerId = order.customerid;
            orderObj.customerName = customer.customerName;
            orderObj.customerSurname = customer.customerSurname;
            orderObj.customerImage = customer.customerImage;
            orderObj.orderNumber = order.ordernumber;
            orderObj.date = order.orderdatetime;
            orderObj.completionTime = order.ordercompletiontime;
            orderObj.status = order.orderstatus;
            orderObj.progress = order.progress;
            orderObj.tip = order.waitertip;
            orderObj.items = items;
            return orderObj;
          }));
      });
      return reviewsArr;
    })
    .catch((err) => {
      console.error('Query Error [Orders - Get Employee Orders]', err.stack);
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
          + ' WHERE restaurantid = $1::integer ORDER BY categoryid ASC;',
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
    }),
  getAvgScore: (employeeid, restaurantId = 0) => (async () => {
    const client = await db.connect();
    try {
      // begin transaction
      await client.query('BEGIN');

      // get average employee score
      const scoreRes = await client.query(
        'SELECT AVG(review.ratingscore) AS "score" FROM public.review'
        + ' INNER JOIN public.customerorder ON customerorder.orderid = review.orderid'
        + ' INNER JOIN public.restauranttable ON restauranttable.tableid = customerorder.tableid'
        + ' WHERE customerorder.employeeid = $1::integer AND restauranttable.restaurantid = $2::integer AND review.employeeid IS NOT NULL',
        [employeeid, restaurantId]
      );

      const score = (scoreRes.rows.length !== 0 && scoreRes.rows[0].score !== null)
        ? parseFloat(scoreRes.rows[0].score.toFixed(2), 10) : 0;
      return score;
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
      console.error('Query Error [Score - Get Avergae Employee Score]', err.stack);
      return [];
    }),
  getEmployees: (restaurantId = 0) => (async () => {
    const client = await db.connect();
    try {
      // begin transaction
      await client.query('BEGIN');

      const employees = await client.query(
        'SELECT person.userid, person.name, person.surname, person.email, person.profileimageurl, restaurantemployee.employeeid, restaurantemployee.employeerole, restaurantemployee.employeenumber FROM public.person'
        + ' INNER JOIN public.restaurantemployee ON restaurantemployee.userid = person.userid'
        + ' WHERE restaurantemployee.restaurantid = $1::integer',
        [restaurantId]
      );

      const employeeList = [];
      employees.rows.forEach((emp) => {
        employeeList.push(getAvgScore(emp.userid, restaurantId)
          .then(async (score) => {
            const employee = {};
            employee.userId = emp.userid;
            employee.employeeId = emp.employeeid;
            employee.name = emp.name;
            employee.surname = emp.surname;
            employee.email = emp.email;
            employee.profileImage = emp.profileimageurl;
            employee.role = emp.employeerole;
            employee.employeeNumber = emp.employeenumber;
            employee.averageRating = score;

            const accessRightPromises = await getEmployeeRights(emp.employeeid);
            employee.rights = [];

            await Promise.all(accessRightPromises)
              .then((accessItem) => {
                accessItem.forEach((access) => {
                  employee.rights.push(access);
                });
              });

            return employee;
          }));
      });
      return employeeList;
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
      console.error('Query Error [Score - Get Avergae Employee Score]', err.stack);
      return [];
    }),
  getEmployeeRights: (employeeId = 0) => (async () => {
    const client = await db.connect();
    try {
      // begin transaction
      await client.query('BEGIN');

      const employees = await client.query(
        'SELECT accessright.description FROM public.employeeaccessright'
        + ' INNER JOIN public.accessright ON accessright.permissionid = employeeaccessright.permissionid'
        + ' WHERE employeeid = $1::integer',
        [employeeId]
      );

      const permissions = [];
      employees.rows.forEach((permission) => {
        permissions.push(permission.description);
      });
      return permissions;
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
      console.error('Query Error [Permissions - Get Employee Permissions]', err.stack);
      return [];
    }),
  getPromotionElements: (restaurantId) => db.query(
    'SELECT * FROM public.promotion'
    + ' WHERE promotion.restaurantid = $1::integer ORDER BY promotionid DESC',
    [restaurantId]
  ).then((res) => {
    const restaurantPromotions = [];
    res.rows.forEach((promotion) => {
      restaurantPromotions.push(getPromoDays(promotion.promotionid)
        .then(async (dayArr) => {
          const promotionItem = {};
          promotionItem.promotionId = promotion.promotionid;
          promotionItem.message = promotion.promotionalmessage;
          promotionItem.image = promotion.promotionalimage;
          promotionItem.startDate = promotion.startdatetime;
          promotionItem.endDate = promotion.enddatetime;
          promotionItem.value = promotion.promotionvalue;
          promotionItem.type = promotion.promotiontype;
          promotionItem.days = dayArr;
          promotionItem.promotions = [];

          const promotionsPromise = await getPromotionGroups(promotion.promotionid);

          await Promise.all(promotionsPromise)
            .then((group) => {
              group.forEach((groupItems) => {
                promotionItem.promotions.push(groupItems);
              });
            });

          return promotionItem;
        }));
    });
    return restaurantPromotions;
  })
    .catch((err) => {
      console.error('Query Error [Promotions - Get Restaurant Promotions]', err.stack);
      return Promise.reject(err);
    }),
  getActivePromotions: () => db.query(
    'SELECT * FROM public.promotion'
    + ' WHERE promotion.enddatetime > NOW() ORDER BY promotionid DESC'
  ).then((res) => {
    const restaurantPromotions = [];
    res.rows.forEach((promotion) => {
      restaurantPromotions.push(getPromoDays(promotion.promotionid)
        .then(async (dayArr) => {
          const promotionItem = {};
          promotionItem.promotionId = promotion.promotionid;
          promotionItem.restaurantId = promotion.restaurantid;
          promotionItem.message = promotion.promotionalmessage;
          promotionItem.image = promotion.promotionalimage;
          promotionItem.startDate = promotion.startdatetime;
          promotionItem.endDate = promotion.enddatetime;
          promotionItem.value = promotion.promotionvalue;
          promotionItem.type = promotion.promotiontype;
          promotionItem.days = dayArr;
          promotionItem.promotions = [];

          const promotionsPromise = await getPromotionGroups(promotion.promotionid);

          await Promise.all(promotionsPromise)
            .then((group) => {
              group.forEach((groupItems) => {
                promotionItem.promotions.push(groupItems);
              });
            });

          return promotionItem;
        }));
    });
    return restaurantPromotions;
  })
    .catch((err) => {
      console.error('Query Error [Promotions - Get Restaurant Promotions]', err.stack);
      return Promise.reject(err);
    }),
};
