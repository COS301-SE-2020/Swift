import axios from 'axios'
const {OAuth2Client} = require('google-auth-library');

// State object
const initialState = () => ({
  customer: {},
  isAuthenticated: false,
  token: null,
});

const state = initialState();

// Getter functions
const getters = {
  getCustomerProfile( state ) {
    return state.customer;
  },
  getCustomerOrderHistory( state ) {
    return state.customer.orderHistory;
  },
  getToken( state ) {
    return state.token;
  },
  isAuthenticated(state) {
    return state.isAuthenticated;
  }
}

// Actions 
const actions = {
  checkInCustomer({commit}, data) {
    console.log(data.qrcode)
    console.log("token: " + this.getters['CustomerStore/getToken'])
    return axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "checkin",
        "qrcode": data.qrcode,
        "token": this.getters['CustomerStore/getToken'],
      }
    ).then(result => {
      console.log("table: " + result.data)
      return result.data;
    }).catch(({ response }) => {
    });
  },

  login({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "login",
        "email": data.email,
        // "email": "johnmay@gmail.com",
        "password": data.password
        // "password": "john123"
      }
    ).then(result => {
      commit('SAVE_TOKEN', result.data.token);
      commit('SAVE_CUSTOMER', result.data);
      this.dispatch('RestaurantsStore/allRestaurants');
      this.dispatch('OrderStore/initOrderHistory');
      return "Success";
    }).catch(({ response }) => {
      return "Fail";
    });
  },

  googleLogin({commit}) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "loginGoogle"
    } 
    ).then(result => {
      return response.data.url
    }).catch(({ response }) => {
      return response.data.url
    });
  },

  register({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "register",
        "name": data.name,
        "surname": data.surname,
        "username": data.username,
        // "username": "john123",
        "email": data.email,
        // "email": "johnmay@gmail.com",
        "password": data.password
        // "password": "john123"
      }
    ).then(result => {
      commit('SAVE_CUSTOMER', result.data);
    }).catch(({ response }) => {
    });
  },

  googleRegister({commit}) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "loginGoogle"
    } 
    ).then(result => {
      return response.data.url
    }).catch(({ response }) => {
      return response.data.url
    });
  },

  reset({ commit }) {
    commit('RESET');
  },

  addFavourite({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "addFavourite",
      "token": this.getters['CustomerStore/getToken'],
      "menuItemId": data.menuItemId
    } 
    ).then(result => {
      commit('UPDATE_FAVOURITES', result.data.favourites);
    }).catch(({ response }) => {
    });
  },

  removeFavourite({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "removeFavourite",
      "token": this.getters['CustomerStore/getToken'],
      "menuItemId": data.menuItemId
    } 
    ).then(result => {
      commit('UPDATE_FAVOURITES', result.data.favourites);
    }).catch(({ response }) => {
    });
  }
}

// Mutations
const mutations = {
  SAVE_TOKEN(state, token) {
    state.token = token;
  },

  SAVE_CUSTOMER(state, customer) {
    state.customer = customer;
  },

  UPDATE_FAVOURITES(state, data) {
    state.customer.favourites = data;
  },


  SET_AUTHENTICATION(state, authentication_state) {
    state.isAuthenticated = authentication_state;
  },

  RESET(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    });
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

