import axios from 'axios'

// State object
const state = {
  customer: {},
}

// Getter functions
const getters = {
  getCustomerProfile( state ) {
    return state.customer;
  },
}

// Actions 
const actions = {
  loadCustomer({commit}) {
    axios.get('https://jsonplaceholder.typicode.com/users/1').then(result => {
      console.log(result);
      commit('SAVE_CUSTOMER', result.data);
    }).catch(error => {
      throw new Error(`API ${error}`);
    });
  },
}

// Mutations
const mutations = {
  SAVE_CUSTOMER(state, customer) {
    state.customer = customer;
  }
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

