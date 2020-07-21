import axios from "@/axios.js"

export default {
  addItem({ commit }, item) {
    return new Promise((resolve, reject) => {
      axios.post("/api/data-list/products/", {item: item})
        .then((response) => {
          commit('ADD_ITEM', Object.assign(item, {id: response.data.id}))
          resolve(response)
        })
        .catch((error) => { reject(error) })
    })
  },
  fetchDataListItems({ commit }) {
    return new Promise((resolve, reject) => {
      axios.get("/api/data-list/products")
        .then((response) => {
          commit('SET_PRODUCTS', response.data)
          resolve(response)
        })
        .catch((error) => { reject(error) })
    })
  },
  // fetchEventLabels({ commit }) {
  //   return new Promise((resolve, reject) => {
  //     axios.get("/api/apps/calendar/labels")
  //       .then((response) => {
  //         commit('SET_LABELS', response.data)
  //         resolve(response)
  //       })
  //       .catch((error) => { reject(error) })
  //   })
  // },
  updateItem({ commit }, item) {
    return new Promise((resolve, reject) => {
      axios.post(`/api/data-list/products/${item.id}`, {item: item})
        .then((response) => {
          commit('UPDATE_PRODUCT', response.data)
          resolve(response)
        })
        .catch((error) => { reject(error) })
    })
  },
  removeItem({ commit }, itemId) {
    return new Promise((resolve, reject) => {
      axios.delete(`/api/data-list/products/${itemId}`)
        .then((response) => {
          commit('REMOVE_ITEM', itemId)
          resolve(response)
        })
        .catch((error) => { reject(error) })
    })
  },
  // eventDragged({ commit }, payload) {
  //   return new Promise((resolve, reject) => {
  //     axios.post(`/api/apps/calendar/event/dragged/${payload.event.id}`, {payload: payload})
  //       .then((response) => {

  //         // Convert Date String to Date Object
  //         let event = response.data
  //         event.startDate = new Date(event.startDate)
  //         event.endDate = new Date(event.endDate)

  //         commit('UPDATE_EVENT', event)
  //         resolve(response)
  //       })
  //       .catch((error) => { reject(error) })
  //   })
  // },
    listMenuItems({commit}, data) {
      axios.post('https://api.swiftapp.ml', 
        {
          "requestType": "restaurantMenu",
          "restaurantId": "1",
          "disableFields" : ["image", "ratingPhrases", "reviews"],
          "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFNRm9zemppWFotWkQ3RVdIYmJpMWdVNVhGREZud1FieUpfeGxILXlQODByUW5tYzFUMDNvcnNBNjR1V2t6T0p5VjhyZDJtYTlHTGhvQ1YwZVI4Q0JMeXEiLCJ5IjoiQVlrTlh0YnJyak8yd0JaaVM4RXVNYy1HcXhVN2RFWjRmYW1iVmtQUExTQVVJYWctTGpGaE40T2ViV18zdkZXWF9GazdSdzR3X2xpUUlyQmdJei1mSE1xUyJ9fQ..ThVfrAZnhwfjKar4N9LUbw.iPMT7Biz-nv3e5UOkLw5FBSIgl1YECV9-ftpdi7MV6NtWKJ6Sr1gZw-R_H2eFcbZ5RUI_CV5sWhnnzTameC1oOSTcQsc7r0wDW1m-TMOZY_0YGkAjzwJz45Wf2Liar4nEN5FbzAWvz9BwOmBF22Je1pBTBD-pBeQqehTTX5ICfQM3q1JWxXzi6cZyy9OJKVmalZqMv7-jVIARM6oG2tZvKJ-KeIY0_o91EeB7nRlcoXZ2w0lgtBPWoDJIgsMBuSaMjTL3S5ssjIBLK48Vwx1ZorL0FcCFDBD-3whv2La8gNujAEXECFSuSBKO3R1vgIxPW72dWxo6pRNQA-sHRVrEr7blR7-A4I1Q5-9-iQ6oKyhXaZbILmj1-avesxbCYa85HeeceWcVl10z_NZ_k6GtyRZ_9thDxi2rhAd6eGWhHcwFrO-35shMTPA8rqdMkRsQAsbvRNcR0XK8L82yhf_oUtnldLq4MP42f2wyh1w-vLkTJVTZ_KeqwK83ah_8TC_9_MBVlVW9j2jWmp_UGsL76BEbaH9_n0bz63FnIfVs97a4X4w7F1WKPZWuMaLiS1bi3iL2cl0o_T-91K4PuxZFwp6NrSGbXTYpQagdD5JWNoaKOLTQ_rDCFc-f-sN2bqk3X-nudqrbfXPZqtZJ4KNKw.HzyjuF5B7MuNniVSUHketQ"
        }
      ).then(result => {

      result.data.categories.forEach(function(category) {
          category.menuItems.forEach(function(menuItem) {
            var item = {  name : menuItem.menuItemName,
                          category : category.categoryName,
                          price: menuItem.price.toFixed(2),
                          //TODO: update to actual statistics
                          popularity: Math.floor(Math.random() * 100) + 30,
                          estimatedWaitingTime : menuItem.estimatedWaitingTime.replace(" min", "")
                       }
            commit('ADD_ITEM', item);
          }); 
      });     
      }).catch(({ response }) => {
      });
    },
}
