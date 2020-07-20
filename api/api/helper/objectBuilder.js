const db = require('../db');

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
};
