import axios from 'axios'

// State object
const initialState = () => ({
  
  orderInfo: {},
  orderedItems: {},
  itemToRate: {},
  paymentInfo: {},
  currentId: -1,
  waiterTip: {},
  
  
  orderHistory: {},
  orderTotal: 0,
  orderFlag: false,
  ratingPhrases: {}
});

const state = initialState();

// Setter functions

// Getter functions
const getters = {
  getOrderInfo(state) {
    return state.orderInfo;
  },

  getWaiterTip(state) {
    return state.waiterTip;
  },

  getOrderedItems(state) {
    return state.orderedItems;
  },

  getPaymentInfo(state) {
    return state.paymentInfo;
  },

  getItemToRate(state) {
    return state.itemToRate;
  },

  getItemsInCart(state) {
    return state.itemsInCart;
  },

  getOrderFlag(state) {
    return state.orderFlag;
  },

  getOrderTotal(state) {
    return state.orderTotal;
  },

  getOrderHistory(state) {
    return state.orderHistory;
  },

  getRatingPhrases(state) {
    return state.ratingPhrases;
  }

  
}

// Actions 
const actions = {
  submitOrder({state, commit}, data) {
    state.orderInfo.waiterTip = data.tip
    if(Object.keys(state.orderedItems).length === 0) {
      
      return axios.post('https://api.swiftapp.ml', 
        {
          "requestType": "addOrder",
          "token": sessionStorage.getItem('authToken'),
          "orderInfo": this.getters['OrderStore/getOrderInfo']
        }
      ).then(result => {
        commit('UPDATE_ORDER_HISTORY', result.data.orderHistory);
        return result.data.orderHistory[0].orderId;
      }).catch(({ response }) => {
      });
    } else {
      axios.post('https://api.swiftapp.ml', 
        {
          "requestType": "updateOrder",
          "token": sessionStorage.getItem('authToken'),
          "orderId": state.orderHistory[0].orderId,
          "orderItems": this.getters['OrderStore/getOrderInfo'].orderItems
        }
      ).then(result => {
        commit('UPDATE_ORDER_HISTORY', result.data.orderHistory);
      }).catch(({ response }) => {
      });
    }
  },

  ratingPhrasesRestaurant({commit}) {
    return axios.post('https://api.swiftapp.ml', 
        {
          "requestType": "ratingPhrases",
          "token": sessionStorage.getItem('authToken')
        }
      ).then(result => {
        commit('SET_RATING_PHRASES', result.data);
        // console.log(result.data)
        return result.data
      }).catch(({ response }) => {
      });
  },

  submitRating({commit}, ratingObject) {
    for (let i = 0; i < ratingObject.ratings.length; i++) {
      axios.post('https://api.swiftapp.ml', 
          {
            "requestType": "addReview",
            "token": sessionStorage.getItem('authToken'),
            "type": ratingObject.ratings[i].type,
            "itemId": ratingObject.ratings[i].itemId,
            "orderId": ratingObject.ratings[i].orderId,
            "ratingScore": ratingObject.ratings[i].ratingScore,
            "comment": ratingObject.ratings[i].comment,
            "public": ratingObject.ratings[i].public,
            "phrases": ratingObject.ratings[i].phrases,
          }
        ).then(result => {
        }).catch(({ response }) => {
        });
    }
  },

  submitPayment({commit}) {
    let data = {
      "requestType": "payment",
        "token": sessionStorage.getItem('authToken'),
        "orderId": this.getters['OrderStore/getPaymentInfo'].orderId,
        "paymentMethod": this.getters['OrderStore/getPaymentInfo'].paymentMethod,
        "amountPaid": this.getters['OrderStore/getPaymentInfo'].amountPaid,
        "restaurantName": this.getters['OrderStore/getPaymentInfo'].restaurantName,
        "menuItemName": this.getters['OrderStore/getPaymentInfo'].menuItemName,
        "name": this.getters['CustomerStore/getCustomerProfile'].name,
        "email": this.getters['CustomerStore/getCustomerProfile'].email,
        "waiterTip": this.getters['OrderStore/getPaymentInfo'].waiterTip,
        "orderTax": this.getters['OrderStore/getPaymentInfo'].orderTax
    }
    
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "payment",
        "token": sessionStorage.getItem('authToken'),
        "orderId": this.getters['OrderStore/getPaymentInfo'].orderId,
        "paymentMethod": this.getters['OrderStore/getPaymentInfo'].paymentMethod,
        "amountPaid": this.getters['OrderStore/getPaymentInfo'].amountPaid,
        "restaurantName": this.getters['OrderStore/getPaymentInfo'].restaurantName,
        "menuitemname": this.getters['OrderStore/getPaymentInfo'].menuItemName,
        "name": this.getters['CustomerStore/getCustomerProfile'].name,
        "email": this.getters['CustomerStore/getCustomerProfile'].email,
        "waiterTip": this.getters['OrderStore/getPaymentInfo'].waiterTip,
        "orderTax": this.getters['OrderStore/getPaymentInfo'].orderTax
      }
    ).then(result => {
      commit('CLEAR_ITEMS');
      // commit('UPDATE_ORDER_FLAG', false);
      // dispatch('OrderStore/updateOrderFlag', false);
      // this.orderFlag = false;
    }).catch(({ response }) => {
    });
  },

  initOrderHistory({commit, state}) {
    var orderHistory = this.getters['CustomerStore/getCustomerOrderHistory']
    // var orderHistory = this.getters['CustomerStore/getFetchedOrderHistory']
    commit('SET_ORDER_HISTORY', orderHistory);
  },

  setOrderHistory({commit}, fetchedOrderHistory) {
    var orderHistory = fetchedOrderHistory
    commit('SET_ORDER_HISTORY', orderHistory);
  },

  setWaiterTip({commit}, tip) {
    commit('SET_WAITER_TIP', tip);
  },

  addItemToOrder({commit,}, orderItemInfo) {
    commit('ADD_ITEM_TO_ORDER', orderItemInfo);
  },

  editOrder({commit,}, orderItemInfo) {
    commit('EDIT_ORDER', orderItemInfo);
  },

  removeItem({commit,}, itemId) {
    commit('REMOVE_ITEM', itemId);
  },
  
  addItemToRate({commit,}, itemInfo) {
    commit('ADD_ITEM_TO_RATE', itemInfo);
  },

  clearOrder({commit,}) {
    commit('CLEAR_ORDER');
  },

  addPaymentInfo({commit,}, orderPaymentinfo) {
    commit('ADD_PAYMENT', orderPaymentinfo);
  },

  retrieveOrderStatus({commit}, data) {
    var orderId = data.orderId;
    axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "orderStatus",
        "orderId": orderId,
        "token": sessionStorage.getItem('authToken')
      }
    ).then(result => {
      var data = {
        "orderId": orderId,
        "orderProgress": result.data.orderProgress,
        "itemProgress": result.data.itemProgress
      }
      // console.log(result.data.itemProgress)
      commit('UPDATE_ORDER_STATUS', data);
    }).catch(({ response }) => {
    });
  },

  reset({ commit }) {
    commit('RESET');
  },

  updateOrderFlag({commit}, orderFlag) {
    commit('UPDATE_ORDER_FLAG', orderFlag);
  },

  updateOrder({commit}) {
    commit('UPDATE_ORDER');
  }
}

// Mutations
const mutations = {
  SET_ORDER_HISTORY(state, orderHistory) {
    state.orderHistory = orderHistory;

    if (orderHistory.length != 0 && orderHistory[0].orderStatus == 'Received') {
      let itemsOrdered = [];
      for (let i = 0; i < orderHistory[0].items.length; i++) {
        // console.log(orderHistory[0].items[i].orderSelections)
        let data = {
          "menuItemId": orderHistory[0].items[i].menuItemId,
          "itemTotal": orderHistory[0].items[i].itemTotal,
          "quantity": orderHistory[0].items[i].quantity,
          "orderSelections": orderHistory[0].items[i].orderselections
        }
        itemsOrdered[i] = data;
      }

      let data = {
        // "orderInfo": {
          "restaurantId": orderHistory[0].restaurantId,
          "tableId": this.getters['CustomerStore/getCheckedInTableId'],
          "employeeId": 6,
          "waiterTip": orderHistory[0].waiterTip,
          "orderItems": itemsOrdered
        // }
      }

      state.orderedItems = data;

    }
    

  },

  CLEAR_ORDER(state) {
    state.orderInfo = {}
  },

  UPDATE_ORDER(state) {
    
  },

  ADD_ITEM_TO_ORDER(state, orderItemInfo) {
    let empty = Object.keys(state.orderInfo).length === 0 && state.orderInfo.constructor === Object
    if (!empty) {
      for (let i = 0; i < orderItemInfo.orderInfo.orderItems.length; i++)
        state.orderInfo.orderItems.push(orderItemInfo.orderInfo.orderItems[i])
    } else
      state.orderInfo = orderItemInfo.orderInfo;
  },

  EDIT_ORDER(state, orderItemInfo) {
    let menuItem = state.orderInfo.orderItems.find((item) => {
      return item.menuItemId == orderItemInfo.menuItemId
    });

    menuItem.itemTotal = orderItemInfo.itemTotal;
    menuItem.quantity = orderItemInfo.quantity;
    menuItem.orderSelections = orderItemInfo.orderSelections;
  },

  REMOVE_ITEM(state, itemId) {
    let itemIndex = -1;
    state.orderInfo.orderItems.find((item, index) => {
      if (item.menuItemId == itemId)
        itemIndex = index;
      return item.menuItemId == itemId
    });

    if (itemIndex != -1) {
      state.orderInfo.orderItems.splice(itemIndex, 1);
      if (state.orderInfo.orderItems.length == 0)
        state.orderInfo = {}
    }
  },

  ADD_PAYMENT(state, orderPaymentinfo) {
    state.paymentInfo = orderPaymentinfo;
  },

  CLEAR_ITEMS(state) {
    state.orderInfo = {}
    state.orderedItems = {}
  },

  SET_RATING_PHRASES(state, ratingPhrases) {
    state.ratingPhrases = ratingPhrases
  },

  SET_WAITER_TIP(state, tip) {
    state.waiterTip = tip
  },

  ADD_ITEM_TO_RATE(state, itemInfo) {
    state.itemToRate = itemInfo;
  },
  
  UPDATE_ORDER_STATUS(state, data) {
    var orderHistory = this.getters['CustomerStore/getCustomerOrderHistory'];

    var item = orderHistory.find(orderItem => 
      orderItem.orderId == data.orderId
    )

    item.progress = data.orderProgress;

    for (let i = 0; i < data.itemProgress.length; i++) {
      var obj = item.items.find(mItem => 
        mItem.menuitemid == data.itemProgress[i].menuItemId
      )
      obj.progress = data.itemProgress[i].progress
    }

    
  },

  UPDATE_ORDER_HISTORY(state, orderInformation) {
    let empty = Object.keys(state.orderedItems).length === 0 && state.orderedItems.constructor === Object
    if (!empty) {
      for (let i = 0; i < state.orderInfo.orderItems.length; i++)
        state.orderedItems.orderItems.push(state.orderInfo.orderItems[i])
    } else {
      state.orderedItems = state.orderInfo;
    }
    // console.log("Order")
    // console.log(state.orderInfo)
    // console.log("Ordered")
    // console.log(state.orderedItems)
    state.orderInfo = {}

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
    // console.log("flag: " + orderFlag)
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

