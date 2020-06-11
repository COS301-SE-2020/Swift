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
  loadCustomer({commit}) {
    axios.get('https://jsonplaceholder.typicode.com/users/1').then(result => {
      console.log(result);
      commit('SAVE_CUSTOMER', result.data);
    }).catch(error => {
      throw new Error(`API ${error}`);
    });
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

