import axios from 'axios'

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
  login({commit, dispatch}, data) {
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "login",
        // "email": data.email,
        "email": "john@doe.com",
        // "password": data.password
        "password": "john123"
      }
    ).then(result => {
      commit('SAVE_TOKEN', result.data.token);
      commit('SAVE_CUSTOMER', result.data);
      this.dispatch('RestaurantsStore/allRestaurants');
      this.dispatch('OrderStore/initOrderHistory');
    }).catch(({ response }) => {
    });
  },

  register({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "register",
        "name": "john",
        "surname": "doe",
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

  reset({ commit }) {
    commit('RESET');
  },
}

// Mutations
const mutations = {
  SAVE_TOKEN(state, token) {
    state.token = token;
  },

  SAVE_CUSTOMER(state, customer) {
    state.customer = customer;
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

