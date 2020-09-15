import axios from "@/axios.js"

export default {
  listEmployees({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "getTableStatus",
      "includeProfileImage": false,
      "token": payload.authKey,
      "restaurantId": payload.currentRestaurantId,
    }).then(response => {
      console.log(response);
      if (response.data.result.length == 0) {
        commit('SET_TABLE_OBJECT', []);
      } else commit('SET_TABLE_OBJECT', response.data.result);
    }).catch(({
      response
    }) => {});
  },
  getAccessRights({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "getAllAccessRights",
      "token": payload.authKey,
    }).then(response => {
      console.log(response);
      commit('SET_ACCESS_RIGHTS', response.data.accessRights);
    }).catch(({
      response
    }) => {
      console.log(response)
    });
  },
  addNewEmployee({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "addEmployee",
      "email": payload.email,
      "role": payload.role,
      "priviliges": payload.priviliges,
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(response => {
      console.log(response);
      resolve(response)
    }).catch(({
      response
    }) => {
      resolve(response)
      console.log(response)
    });
  });
  },
}