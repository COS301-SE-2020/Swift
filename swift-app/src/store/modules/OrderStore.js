// State object
const initialState = () => ({
  orderTotal: 0
});

const state = initialState();

// Setter functions

// Getter functions
const getters = {
  getOrderTotal(state) {
    return state.orderTotal;
  },
}

// Actions 
const actions = {
  // Used to reset the store
  reset({ commit }) {
    commit('RESET');
  },

  fetchVariable1({ commit }) {
    return new Promise( (resolve, reject) => {
      // Make network request and fetch data
      // and commit the data
      commit('SET_VARIABLE_1', data); 
      resolve();
    })
  }
}

// Mutations
const mutations = {
  // Used to reset the store
  RESET(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    });
  },

  setOrderTotal(state, data) {
    state.orderTotal = data;
  },
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

