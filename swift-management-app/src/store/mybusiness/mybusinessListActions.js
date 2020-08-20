import axios from "@/axios.js"

export default {
  addNewRestaurant({
    commit
  }, payload) {
    var restaurant = {
      name: payload.restaurantName,
      branch: payload.restaurantBranch,
      description: payload.restaurantDesc,
      image: payload.restaurantImage
    }

    commit('ADD_RESTAURANT', restaurant);
    
    axios({
      method: 'post',
      url: process.env.VUE_APP_BASEURL,
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
    axios.post(process.env.VUE_APP_BASEURL, {
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