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
          "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFhR19TWm1Vc0tpTVdFZDB6SWVha1g0Q2EyZk0tZlVhSGxITWtoQXQwN1d4YkFIV1NCRU1sZS1VVWhmckFaZ0ZXb3pja0JScHpLbXRTMGRnb0RKekxpM1QiLCJ5IjoiQWJGdXQ3Xy05ZGVNSWVkRDV5R0VGOXZiSG84d1h2OTc3TlZNZ0F4ZjZrT0ZwdFBldkhLNFY2cnpETEtkSElRT1N1TkpCelIySmNLekt4RjgxT29sQ2hZTCJ9fQ..fcGdsBXuoATxMpKy9ZTy4g.g3Pi_S3UJ-ZdfnKLs1LDY0GSmkV8ZSRhXvrU77xC1kM7MYBAMilsv5phV5xgEy0utI-92wHYFo9pBUPWRYsZq1auHg56Objsdf7G04Ao-mWglfUewrx2cl_PhuACqmb8WZeLXiJVXtFgMuKuwuPquw2Rf2ELi2FfoKw2M559Vp7gVdHueY0oXn0Z0cJiSQA-zSZMkl1QCYNPBlYTqp3R7MZ9DMSg7kgcrWsX25Iko4tINHEXeHLgmrx5_C02kYyioVDisIWMLEuSnMFexwSl_vxtaH-c9E_XOhYorDaf1ccF6-gSg10MzI7X5cJLylmG9qxs8r3ZamcuOA33QyfZ2GHmGJsAfMPSsujQCEpmYfp38NYW751qwQs9eg5OJ6hSZ7nChTGyw5cOqwf5aqou1898li_-VEC_5oY1DUlOs5qavcUw8Y5u5hrBpgCSp1C7bqrJp8fw2fmG1TeKpKE5IYVZwkw4EUxE262fI8c_g64Z4knWvpXEGTMozr8A1_VllD9jXnULlHlFLsB6VbWJRv4aJMiit5D8PhqfjSgEbfGiPNRG7KcS7pnSYTOPAiTbATfYK0hvL37srbpDdv2mcn8BharBCRjFYGPsMxXmkB4.xMF73hjuI56bsrmjk8dQtA"
        }
      ).then(result => {
        console.log(result);
      
      commit('SET_RESTAURANT_OBJECT', result.data);
      
      result.data.categories.forEach(function(category) {
          category.menuItems.forEach(function(menuItem) {
            var item = {  name : menuItem.menuItemName,
                          //TODO: Implement sub-categories on API end
                          category : category.categoryName,
                          price: menuItem.price.toFixed(2),
                          id: menuItem.menuItemId,
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
