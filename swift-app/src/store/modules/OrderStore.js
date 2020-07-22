// State object
const initialState = () => ({
  orderInfo: {},
  orderHistory: {},
  orderTotal: 0,
  orderFlag: false
});

const state = initialState();


// Setter functions

// Getter functions
const getters = {
  getOrderInfo(state) {
    return state.orderInfo;
  },

  getOrderHistory(state) {
    return state.orderHistory;
  },

  getOrderTotal(state) {
    return state.orderTotal;
  },

  getOrderFlag(state) {
    return state.orderFlag;
  },
}

// Actions 
const actions = {
  submitOrder({commit}, orderInfo) {
  },

  initOrderHistory({commit, state}) {
    var orderHistory = this.getters['CustomerStore/getCustomerOrderHistory']
    commit('SET_ORDER_HISTORY', orderHistory);
  },

  updateOrderHistory({commit, state}) {
    // commit('SET_ORDER_HISTORY', orderHistory);
  },

  // Used to reset the store
  reset({ commit }) {
    commit('RESET');
  },

  updateOrderFlag({commit}, orderFlag) {
    commit('updateOrderFlag', orderFlag);
  }
}

// Mutations
const mutations = {
  addItemToOrderInfo(state, data) {
    // state.orderTotal = data;
  },

  SET_ORDER_HISTORY(state, orderHistory) {
    state.orderHistory = orderHistory;
  },

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

