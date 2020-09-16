import axios from "@/axios.js"
import router from "../../router"

export default {
  login({
    commit,
    dispatch
  }, data) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_BASEURL, {
        "requestType": "login",
        "email": data.userDetails.email,
        "password": data.userDetails.password
      }).then(result => {

        console.log(result)

        commit('SAVE_TOKEN', result.data.token);
        commit('SAVE_USER', result.data);
        commit('SET_AUTHENTICATION', true);

        dispatch("updateUserInfo", {
          displayName: result.data.name + ' ' + result.data.surname
        }, {
          root: true
        });
        dispatch("updateTheme", "light", {
          root: true
        });
        dispatch("updateUserInfo", {
          photoURL: null
        }, {
          root: true
        });

        console.log(result);
        resolve(result);
      }).catch(({
        response
      }) => {
        resolve(response);
        console.log(response);
      });
    });
  },
  register({
    commit
  }, data) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_BASEURL, {
        "requestType": "register",
        "name": data.userDetails.name,
        "surname": data.userDetails.surname,
        "email": data.userDetails.email,
        "password": data.userDetails.password
      }).then(result => {
        console.log(result);
        resolve(result);
        commit('SAVE_USER', result.data);
      }).catch(({
        response
      }) => {
        console.log(response);
      });
    });
  },
  reset({
    commit
  }) {
    commit('RESET');
  },
}