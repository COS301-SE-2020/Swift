import axios from 'axios'

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

  addItemToOrder({commit, state}, orderItemInfo) {
    commit('ADD_ITEM_TO_ORDER', orderItemInfo);
  },

  updateOrderHistory({commit, state}) {
    // commit('SET_ORDER_HISTORY', orderHistory);
  },

  retrieveOrderStatus({commit}, data) {
    var token = this.getters['CustomerStore/getToken'];
    var orderId = data.orderId;
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "orderStatus",
        "orderId": orderId,
        "token": token
      }
    ).then(result => {
      var data = {
        "orderId": orderId,
        "orderStatus": result.data.orderStatus 
      }

      commit('UPDATE_ORDER_STATUS', data);
    }).catch(({ response }) => {
    });
  },

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

  ADD_ITEM_TO_ORDER(state, orderItemInfo) {
    // Append order to OrderInfo
  },
  
  UPDATE_ORDER_STATUS(state, data) {
    var orderHistory = this.getters['OrderStore/getOrderHistory'];

    var item = orderHistory.find(orderItem => 
      orderItem.orderId == data.orderId
    )

    item.orderStatus = data.orderStatus;
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

