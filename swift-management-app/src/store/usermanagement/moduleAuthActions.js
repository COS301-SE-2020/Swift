import axios from "@/axios.js"
import router from "../../router"

export default {
    login({commit, dispatch}, data) {
        axios.post('https://api.swiftapp.ml', 
          {
            "requestType": "loginAdmin",
            "email": data.userDetails.email,
            "password": data.userDetails.password
          }
        ).then(result => {
          commit('SAVE_TOKEN', result.data.token);
          commit('SAVE_USER', result.data);
          commit('SET_AUTHENTICATION', true);
          router.push('/') 
          //TODO: Load dashboard stats
          //     this.dispatch('/');
        }).catch(({ response }) => 
        {
          console.log(response);
        });
    },
    register({commit}, data) {
        axios.post('https://api.swiftapp.ml', 
          {
            "requestType": "registerAdmin",
            "name": data.userDetails.name,
            "surname": data.userDetails.surname,
            "username": data.userDetails.username,
            "email": data.userDetails.email,
            "password": data.userDetails.password
          }
        ).then(result => {
          console.log(result);
          commit('SAVE_CUSTOMER', result.data);
        }).catch(({ response }) => {
          console.log(response);
        });
      },
      reset({ commit }) {
        commit('RESET');
      },
}
