const db = require('../db');

// helper to get individual order items
const getOrderItems = async (oid = 0) => db.query(
  'SELECT menuitem.menuitemid, menuitem.menuitemname, menuitem.menuitemdescription,'
    + ' menuitem.price, itemordered.quantity, itemordered.orderselections'
    + ' FROM public.itemordered'
    + ' INNER JOIN public.menuitem ON menuitem.menuitemid = itemordered.menuitemid'
    + ' WHERE itemordered.orderid = $1::integer;',
  [oid]
)
  .then((orderItems) => {
    const orderHistoryItems = [];
    let orderTotal = 0.0;
    orderItems.rows.forEach((ordItem) => {
      const orderItem = {};
      orderItem.menuItemId = ordItem.menuitemid;
      orderItem.menuItemName = ordItem.menuitemname;
      orderItem.menuItemDescription = ordItem.menuitemdescription;
      orderItem.price = ordItem.price;
      orderItem.quantity = ordItem.quantity;
      orderItem.orderselections = ordItem.orderselections;
      orderTotal += (orderItem.price * ordItem.quantity);
      orderHistoryItems.push(orderItem);
    });
    return { orderTotal, items: orderHistoryItems };
  })
  .catch((err) => {
    console.error('Query Error [Order Helper - Get Order Items]', err.stack);
    return [];
  });

// helper to get individual menu items
const getMenuItems = async (restaurantId = 0, categoryId = 0) => db.query(
  'SELECT menuitemid, menuitemname, menuitemdescription, price, estimatedwaitingtime,'
  + ' menuitem.attributes, arasset, availability FROM public.menuitem'
  + ' WHERE restaurantid = $1::integer AND categoryid = $2::integer;',
  [restaurantId, categoryId]
)
  .then((menuItems) => {
    const menuItemsArr = [];
    menuItems.rows.forEach((resMenuItem) => {
      const menuItem = {};
      menuItem.menuItemId = resMenuItem.menuitemid;
      menuItem.menuItemName = resMenuItem.menuitemname;
      menuItem.menuItemDescription = resMenuItem.menuitemdescription;
      menuItem.price = resMenuItem.price;
      menuItem.estimatedWaitingTime = resMenuItem.estimatedwaitingtime;
      menuItem.attributes = resMenuItem.attributes;
      menuItem.arAsset = resMenuItem.arasset;
      menuItem.availability = resMenuItem.availability;
      menuItemsArr.push(menuItem);
    });
    return { menuItemsArr };
  })
  .catch((err) => {
    console.error('Query Error [Menu Helper - Get Menu Items]', err.stack);
    return [];
  });

module.exports = {
  getFavourites: (userId = 0) => db.query(
    'SELECT menuitem.menuitemid, menuitem.menuitemname, menuitem.menuitemdescription,'
    + ' restaurant.restaurantid, restaurant.restaurantname FROM public.menuitem'
    + ' INNER JOIN public.restaurant ON menuitem.restaurantid = restaurant.restaurantid'
    + ' INNER JOIN public.favourite ON menuitem.menuitemid = favourite.menuitemid'
    + ' WHERE favourite.customerid = $1::integer;',
    [userId]
  )
    .then((res) => {
      const favouritesArr = [];
      res.rows.forEach((fav) => {
        const favItem = {};
        favItem.restaurantId = fav.restaurantid;
        favItem.restaurantName = fav.restaurantname;
        favItem.menuItemId = fav.menuitemid;
        favItem.menuItemName = fav.menuitemname;
        favItem.menuItemDescription = fav.menuitemdescription;
        favouritesArr.push(favItem);
      });
      return favouritesArr;
    })
    .catch((err) => {
      console.error('Query Error [Favourites - Get User Favourites]', err.stack);
      return [];
    }),
  getOrderItems,
  getOrderHistory: (userId = 0) => db.query(
    'SELECT customerorder.orderid, restaurant.restaurantid, restaurant.restaurantname,'
    + ' restaurant.location, customerorder.orderdatetime, customerorder.ordercompletiontime,'
    + ' customerorder.orderstatus, employee.name AS "ename", employee.surname AS "esurname"'
    + ' FROM public.customerorder'
    + ' INNER JOIN public.restauranttable ON customerorder.tableid = restauranttable.tableid'
    + ' INNER JOIN public.restaurant ON restauranttable.restaurantid = restaurant.restaurantid'
    + ' INNER JOIN public.employee ON customerorder.employeeid = employee.userid'
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
            historyItem.restaurantId = hist.restaurantid;
            historyItem.restaurantName = hist.restaurantname;
            historyItem.restaurantLocation = hist.location;
            historyItem.orderDateTime = hist.orderdatetime;
            historyItem.orderCompletionTime = hist.ordercompletiontime;
            historyItem.orderStatus = hist.orderstatus;
            historyItem.total = orderItems.orderTotal;
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
  getRatingPhrases: (restaurantId = 0) => db.query(
    'SELECT ratingphrase.phrasedescription, AVG(customerphraserating.ratingscore) AS "rating"'
    + ' FROM public.customerphraserating'
    + ' INNER JOIN public.ratingphrase ON ratingphrase.phraseid = customerphraserating.phraseid'
    + ' INNER JOIN public.review ON customerphraserating.reviewid = review.reviewid'
    + ' WHERE review.restaurantid = $1::integer'
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
  getMenuCategories: (restaurantId = 0) => db.query(
    'SELECT categoryid, categoryname, categorydescription, parentcategoryid, categorytype'
    + ' FROM public.category'
    + ' WHERE restaurantid = $1::integer;',
    [restaurantId]
  )
    .then((res) => {
      const menuItemPromises = [];
      res.rows.forEach((menuCategory) => {
        menuItemPromises.push(getMenuItems(restaurantId, menuCategory.categoryid)
          .then((resMenuItem) => {
            const categoryItem = {};
            categoryItem.categoryName = menuCategory.categoryname;
            categoryItem.description = menuCategory.categorydescription;
            categoryItem.parentCategoryId = menuCategory.parentcategoryid;
            categoryItem.type = menuCategory.categorytype;
            categoryItem.menuItems = resMenuItem.menuItemsArr;
            return categoryItem;
          })
          .catch((err) => {
            console.error('Query Error [Restaurant Helper - Get Restaurant Menu Item]', err.stack);
            // empty on error
            return [];
          }));
      });
      return menuItemPromises;
    })
    .catch((err) => {
      console.error('Query Error [Categories - Get Restaurant Menu Categories]', err.stack);
      return [];
    })
};
