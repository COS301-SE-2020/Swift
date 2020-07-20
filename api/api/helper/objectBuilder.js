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
      orderHistoryItems.push(ordItem);
    });
    return { orderTotal, items: orderHistoryItems };
  })
  .catch((err) => {
    console.error('Query Error [Order Helper - Get Order Items]', err.stack);
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
    })
};
