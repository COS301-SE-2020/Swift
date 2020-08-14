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

  async googleLogin({commit}, data) {
    const client = new OAuth2Client('415163052147-np5h380l61kp40l50eqk5qqgh3t3ku2r.apps.googleusercontent.com');
    const ticket = await client.verifyIdToken({
      idToken: data.google.id_token,
      audience: '415163052147-np5h380l61kp40l50eqk5qqgh3t3ku2r.apps.googleusercontent.com'
    });
    const payload = ticket.getPayload();
    console.log('Google payload is '+JSON.stringify(payload));
    const userid = payload['sub'];
    let email = payload['email'];
    let emailVerified = payload['email_verified'];
    let name = payload["name"];
    let pictureUrl = payload["picture"];
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

  async googleRegister({commit}, data) {
    const client = new OAuth2Client('415163052147-np5h380l61kp40l50eqk5qqgh3t3ku2r.apps.googleusercontent.com');
    const ticket = await client.verifyIdToken({
      idToken: data.google.id_token,
      audience: '415163052147-np5h380l61kp40l50eqk5qqgh3t3ku2r.apps.googleusercontent.com'
    });
    const payload = ticket.getPayload();
    console.log('Google payload is '+JSON.stringify(payload));
    const userid = payload['sub'];
    let email = payload['email'];
    let emailVerified = payload['email_verified'];
    let name = payload["name"];
    let pictureUrl = payload["picture"];
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

