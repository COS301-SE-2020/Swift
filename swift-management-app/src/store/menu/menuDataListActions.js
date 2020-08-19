import axios from "@/axios.js"

export default {
  listMenuItems({
    commit
  }, payload) {
    axios.post('https://api.swiftapp.ml', {
      "requestType": "restaurantMenu",
      "restaurantId": "35",
      "disableFields": ["image", "ratingPhrases", "reviews"],
      "token": payload.authKey,
    }).then(result => {
      console.log(result);

      commit('SET_RESTAURANT_OBJECT', result.data);

      result.data.categories.forEach(function (category) {
        category.menuItems.forEach(function (menuItem) {
          var item = {
            name: menuItem.menuItemName,
            //TODO: Implement sub-categories on API end
            category: category.categoryName,
            price: menuItem.price.toFixed(2),
            id: menuItem.menuItemId,
            //TODO: update to actual statistics
            popularity: Math.floor(Math.random() * 100) + 30,
            estimatedWaitingTime: menuItem.estimatedWaitingTime.replace(" min", "")
          }
          commit('ADD_ITEM', item);
        });
      });
    }).catch(({
      response
    }) => {});
  },
}