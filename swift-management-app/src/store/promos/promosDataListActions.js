import axios from "@/axios.js"

export default {
  addNewPromo({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_BASEURL, {
        "requestType": "addPromotion",
        "token": payload.authKey,
        "restaurantId": payload.restaurantId,
        "message": payload.message,
        "image": payload.image,
        "startDate": payload.startDate,
        "endDate": payload.endDate,
        "days": payload.days,
        "value": payload.value,
        "type": payload.type,
        "promotions": payload.promotions,
      }).then(result => {
        console.log(result);
        resolve(result);
      }).catch(({
        response
      }) => {
        resolve(response);
        console.log(response)
      });
    });
  },
  listPromos({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_BASEURL, {
        "requestType": "listRestaurantPromotions",
        "token": payload.authKey,
        "restaurantId": payload.restaurantId,
      }).then(result => {
        console.log(result);
        commit('SET_PROMOS_OBJECT', result.data.restaurantPromo);

        resolve(result);
      }).catch(({
        response
      }) => {
        resolve(response);
        console.log(response)
      });
    });
  },
  listRecommendedPromo({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_MLURL, {
        "requestType": "promoSuggest",
        "token": payload.authKey,
        "restaurantId": parseInt(payload.restaurantId),
      }).then(result => {
        console.log(result);

        if (result.data) {
          var firstGroup = [];
          for (var i = 0; i < result.data[0].antecedents.length; i++) {
            firstGroup.push(result.data[0].antecedents[i]);
          }

          for (var i = 0; i < result.data[0].consequents.length; i++) {
            firstGroup.push(result.data[0].consequents[i]);
          }
          commit('SET_RECOMMENDED_OBJECT', firstGroup);
        }




        resolve(result);
      }).catch(({
        response
      }) => {
        resolve(response);
        console.log(response)
      });
    });
  }
}