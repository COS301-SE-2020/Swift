// State object
const initialState = () => ({
  orderInfo: {},
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
    /* var token = this.getters['CustomerStore/getToken']
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "addOrder",
        "token": token,
        "orderInfo": this.getOrderInfo(),
      }
    ).then(result => {
      console.log("MENU: ", result.data)
      commit('SAVE_MENU', result.data);
    }).catch(({ response }) => {}); */
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

