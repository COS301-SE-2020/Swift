import axios from 'axios'

// State object
const initialState = () => ({
  customer: {},
});

const state = initialState();

// Getter functions
const getters = {
  getCustomerProfile( state ) {
    return state.customer;
  },
}

// Actions 
const actions = {
  login({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "login",
        // "email": data.email,
        "email": "johnmay@gmail.com",
        // "password": data.password
        "password": "john123"
      }
    ).then(result => {
      commit('SAVE_CUSTOMER', result.data);
      console.log(result.data.username)
    })
    .catch(e => {
      throw new Error(`API ${e}`);
    })
  },

  reset({ commit }) {
    commit('RESET');
  },
}

// Mutations
const mutations = {
  SAVE_CUSTOMER(state, customer) {
    state.customer = customer;
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

