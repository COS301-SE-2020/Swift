import axios from 'axios'

// State object
const initialState = () => ({
  orderInfo: {},
  paymentInfo: {},
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

  getPaymentInfo(state) {
    return state.paymentInfo;
  }
}

// Actions 
const actions = {
  submitOrder({commit}) {
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

  submitPayment({commit}) {
    console.log("PAYMENT INFO:")
    console.log(this.getters['CustomerStore/getCustomerProfile']);
    console.log(this.getters['OrderStore/getPaymentInfo']);
    let data = {
      "requestType": "payment",
        "token": sessionStorage.getItem('authToken'),
        "orderId": this.getters['OrderStore/getPaymentInfo'].orderId,
        "paymentMethod": this.getters['OrderStore/getPaymentInfo'].paymentMethod,
        "amountPaid": this.getters['OrderStore/getPaymentInfo'].amountPaid,
        "name": this.getters['CustomerStore/getCustomerProfile'].name,
        "email": this.getters['CustomerStore/getCustomerProfile'].email,
        "waiterTip": this.getters['OrderStore/getPaymentInfo'].waiterTip,
        "orderTotal": this.getters['OrderStore/getPaymentInfo'].orderTotal,
        "orderTax": this.getters['OrderStore/getPaymentInfo'].orderTax
    }
    console.log(data)
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "payment",
        "token": sessionStorage.getItem('authToken'),
        "orderId": this.getters['OrderStore/getPaymentInfo'].orderId,
        "paymentMethod": this.getters['OrderStore/getPaymentInfo'].paymentMethod,
        "amountPaid": this.getters['OrderStore/getPaymentInfo'].amountPaid,
        "name": this.getters['CustomerStore/getCustomerProfile'].name,
        "email": this.getters['CustomerStore/getCustomerProfile'].email,
        "waiterTip": this.getters['OrderStore/getPaymentInfo'].waiterTip,
        "orderTotal": this.getters['OrderStore/getPaymentInfo'].orderTotal,
        "orderTax": this.getters['OrderStore/getPaymentInfo'].orderTax
      }
    ).then(result => {
      // commit('UPDATE_ORDER_HISTORY', result.data.orderHistory);
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

  clearOrder({commit,}) {
    commit('CLEAR_ORDER');
  },

  addPaymentInfo({commit,}, orderPaymentinfo) {
    commit('ADD_PAYMENT', orderPaymentinfo);
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
    commit('UPDATE_ORDER_FLAG', orderFlag);
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

  CLEAR_ORDER(state) {
    state.orderInfo = {}
    // console.log("now empty")
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

  ADD_PAYMENT(state, orderPaymentinfo) {
    state.paymentInfo = orderPaymentinfo;
    console.log("payment added")
    console.log(state.paymentInfo)
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

  UPDATE_ORDER_FLAG(state, orderFlag) {
    console.log("flag: " + orderFlag)
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

