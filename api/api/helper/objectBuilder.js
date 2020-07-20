const db = require('../db');

module.exports = {
  getFavourites: (userId = 0) => db.query(
    'SELECT menuitem.menuitemname, menuitem.menuitemdescription, restaurant.restaurantname'
    + ' FROM public.menuitem INNER JOIN public.restaurant'
    + ' ON menuitem.restaurantid = restaurant.restaurantid'
    + ' INNER JOIN public.favourite ON menuitem.menuitemid = favourite.menuitemid'
    + ' WHERE favourite.customerid = $1::integer;',
    [userId]
  )
    .then((res) => {
      const favouritesArr = [];
      res.rows.forEach((fav) => {
        const favItem = {};
        favItem.restaurantName = fav.restaurantname;
        favItem.menuItemName = fav.menuitemname;
        favItem.menuItemDescription = fav.menuitemdescription;
        favouritesArr.push(favItem);
      });
      return favouritesArr;
    })
};
