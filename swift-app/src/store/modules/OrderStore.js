// State object
const initialState = () => ({
  orderTotal: 0,
  orderFlag: false
});

const state = initialState();


// Setter functions

// Getter functions
const getters = {
  getOrderTotal(state) {
    return state.orderTotal;
  },

  getOrderFlag(state) {
    return state.orderFlag;
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
  },

  updateOrderFlag({commit}, orderFlag) {
    commit('updateOrderFlag', orderFlag);
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

  updateOrderFlag(state, orderFlag) {
    state.orderFlag = orderFlag;
  }
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

