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
    console.log("in here");
    console.log(state.orderInfo);
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
  submitOrder({commit}) {
    // console.log(this.orderInfo);
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "addOrder",
        "token": sessionStorage.getItem('authToken'),
        "orderInfo": this.getters['OrderStore/getOrderInfo'].orderInfo
      }
    ).then(result => {
      commit('UPDATE_ORDER_HISTORY', result.data.orderHistory);
    }).catch(({ response }) => {
    });
  },

  initOrderHistory({commit, state}) {
    var orderHistory = this.getters['CustomerStore/getCustomerOrderHistory']
    commit('SET_ORDER_HISTORY', orderHistory);
  },

  addItemToOrder({commit,}, orderItemInfo) {
    commit('ADD_ITEM_TO_ORDER', orderItemInfo);
  },

  retrieveOrderStatus({commit}, data) {
    var orderId = data.orderId;
    // console.log(orderId)
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "orderStatus",
        "orderId": orderId,
        "token": sessionStorage.getItem('authToken')
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
    console.log("CHECKS:")
    let empty = Object.keys(state.orderInfo).length === 0 && state.orderInfo.constructor === Object
    console.log(orderItemInfo)
    console.log(state.orderInfo)
    console.log("check if null: "  + empty)
    if (!empty) {
      console.log(state.orderInfo.orderItems)
      for (let i = 0; i < orderItemInfo.orderInfo.orderItems.length; i++)
        state.orderInfo.orderItems.push(orderItemInfo.orderInfo.orderItems[i])
    }else
      state.orderInfo = orderItemInfo.orderInfo;
    console.log(state.orderInfo)
  },
  
  UPDATE_ORDER_STATUS(state, data) {
    var orderHistory = this.getters['OrderStore/getOrderHistory'];

    var item = orderHistory.find(orderItem => 
      orderItem.orderId == data.orderId
    )

    item.orderStatus = data.orderStatus;
  },

  UPDATE_ORDER_HISTORY({commit}, orderInformation) {
    this.getters['CustomerStore/getCustomer'].orderHistory = orderInformation;
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

