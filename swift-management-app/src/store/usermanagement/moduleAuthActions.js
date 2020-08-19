import axios from "@/axios.js"
import router from "../../router"

export default {
  login({
    commit,
    dispatch
  }, data) {
    return new Promise((resolve, reject) => {
      axios.post('https://api.swiftapp.ml', {
        "requestType": "login",
        "email": data.userDetails.email,
        "password": data.userDetails.password
      }).then(result => {
        commit('SAVE_TOKEN', result.data.token);
        commit('SAVE_USER', result.data);
        commit('SET_AUTHENTICATION', true);

        //    this.$store.dispatch("updateUserInfo", {
        //     displayName: result.data.name + ' ' + result.data.surname
        //  });
        //   this.$store.dispatch("updateTheme", "dark");
        //    this.$store.dispatch("updateUserInfo", {photoURL: });

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
    axios.post('https://api.swiftapp.ml', {
      "requestType": "register",
      "name": data.userDetails.name,
      "surname": data.userDetails.surname,
      "email": data.userDetails.email,
      "password": data.userDetails.password
    }).then(result => {
      console.log(result);
      commit('SAVE_USER', result.data);
    }).catch(({
      response
    }) => {
      console.log(response);
    });
  },
  reset({
    commit
  }) {
    commit('RESET');
  },
}