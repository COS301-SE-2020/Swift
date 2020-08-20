import axios from "@/axios.js"

export default {
  listMenuItems({
    commit, state
  }, payload) {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "restaurantMenu",
      "restaurantId": payload.currentRestaurantId,
      "disableFields": ["image", "ratingPhrases", "reviews"],
      "token": payload.authKey,
    }).then(result => {
      console.log(result);

      commit('SET_RESTAURANT_OBJECT', result.data);

    }).catch(({
      response
    }) => {});
  },
}