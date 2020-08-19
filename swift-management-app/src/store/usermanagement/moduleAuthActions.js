import axios from "@/axios.js"
import router from "../../router"

export default {
    login({commit, dispatch}, data) {
        axios.post('https://api.swiftapp.ml', 
          {
            "requestType": "login",
            "email": data.userDetails.email,
            "password": data.userDetails.password
          }
        ).then(result => {
          commit('SAVE_TOKEN', result.data.token);
          commit('SAVE_USER', result.data);
          commit('SET_AUTHENTICATION', true);
          console.log(result.data.token);
          router.push('/') 
        }).catch(({ response }) => 
        {
          console.log(response);
        });
    },
    register({commit}, data) {
        axios.post('https://api.swiftapp.ml', 
          {
            "requestType": "register",
            "name": data.userDetails.name,
            "surname": data.userDetails.surname,
            "email": data.userDetails.email,
            "password": data.userDetails.password
          }
        ).then(result => {
          console.log(result);
          commit('SAVE_USER', result.data);
        }).catch(({ response }) => {
          console.log(response);
        });
      },
      reset({ commit }) {
        commit('RESET');
      },
}
