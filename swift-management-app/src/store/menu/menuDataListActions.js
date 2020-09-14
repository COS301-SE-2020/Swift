import axios from "@/axios.js"

export default {
  listMenuItems({
    commit,
    state
  }, payload) {
    return new Promise((resolve, reject) => {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "restaurantMenu",
      "restaurantId": payload.currentRestaurantId,
      "disableFields": ["image", "ratingPhrases", "reviews"],
      "token": payload.authKey,
    }).then(result => {
      console.log(result);

      commit('SET_RESTAURANT_OBJECT', result.data);
      resolve(result);

    }).catch(({
      response
    }) => {console.log(response)});
  });
  },
  addMenuCategory({
    dispatch
  }, payload) {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "addMenuCategory",
      "restaurantId": payload.currentRestaurantId,
      "categoryName": payload.categoryName,
      "categoryDescription": payload.categoryDescription,
      "categoryType": payload.categoryType,
      "parentCategoryId": payload.parentCategoryId,
      "token": payload.authKey,
    }).then(result => {
      dispatch("listMenuItems", {
        currentRestaurantId: payload.currentRestaurantId,
        authKey: payload.authKey
      });

      console.log(result);
      //dispatch reload possible categories

    }).catch(({
      response
    }) => {});
  },
  addMenuItem({
    dispatch
  }, payload) {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "addMenuItem",
      "token": payload.authKey,
      "restaurantId": payload.currentRestaurantId,
      "categoryId": payload.categoryId,
      "itemName": payload.itemName,
      "itemDescription": payload.itemDescription,
      "price": payload.itemPrice,
      "waitingTime": payload.itemWaitingTime,
      "attributes": payload.itemAttributes,
      "arAsset": payload.arAsset,
      "available": payload.available,
      "images": payload.itemImages,
    }).then(result => {

      dispatch("listMenuItems", {
        currentRestaurantId: payload.currentRestaurantId,
        authKey: payload.authKey
      });

      console.log(result);
      //dispatch reload possible categories

    }).catch(({
      response
    }) => {});
  },

}