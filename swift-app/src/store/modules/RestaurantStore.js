// State object
const initialState = () => ({
  tableNumber: "Checked in manually"
});

const state = initialState();

// Setter functions

// Getter functions
const getters = {
  getTableNumber(state) {
    return state.tableNumber;
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

  setTableNumber(state, data) {
    state.tableNumber = data;
  },
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

