import axios from "@/axios.js"

export default {
  listEmployees({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "getRestaurantEmployees",
      "restaurantId": payload.restaurantId,
      "token": payload.authKey
    }).then(response => {
      console.log(response);
      commit('SET_EMP_OBJECT', response.data.employees);
      resolve(response);
    }).catch(({
      response
    }) => {console.log(response)});
  });
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