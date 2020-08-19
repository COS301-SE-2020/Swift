import axios from "@/axios.js"

export default {
  addNewRestaurant({
    commit
  }, payload) {
    axios({
      method: 'post',
      url: 'https://api.swiftapp.ml',
      data: {
        "requestType": "createRestaurant",
        "token": payload.authKey,
        "name": payload.restaurantName,
        "description": payload.restaurantDesc,
        "branch": payload.restaurantBranch,
        "location": "Centurion",
        "categories": JSON.parse(payload.restaurantCategories),
        "coverImageURL": payload.restaurantImage
      }
    }).then(result => {
      console.log(result);

    }).catch(({
      response
    }) => {
      console.log(response)
    });
  },
  retrieveRestaurantCategories({
    commit
  }, payload) {
    axios.post('https://api.swiftapp.ml', {
      "requestType": "allRestaurantCategories",
      "token": payload.authKey,
    }).then(result => {
      console.log("Restaurant Category Options", result);
      commit('SET_RESTAURANT_CATEGORY_OPTIONS', result.data.categories);

    }).catch(({
      response
    }) => {
      console.log(response)
    });
  },
}