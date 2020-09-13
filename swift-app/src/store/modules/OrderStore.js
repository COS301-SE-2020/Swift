import axios from 'axios'

// State object
const initialState = () => ({
  
  orderInfo: {},
  orderedItems: {},
  itemToRate: {},
  paymentInfo: {},
  currentId: -1,
  
  
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

  getOrderedItems(state) {
    return state.orderedItems;
  },

  getPaymentInfo(state) {
    return state.paymentInfo;
  },

  getItemToRate(state) {
    console.log("FETCH DATA")
    console.log(state.itemToRate)
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
      
      axios.post('https://api.swiftapp.ml', 
        {
          "requestType": "addOrder",
          "token": sessionStorage.getItem('authToken'),
          "orderInfo": this.getters['OrderStore/getOrderInfo']
        }
      ).then(result => {

        var maxid = 0;
        var maxobj;

        result.data.orderHistory.map(obj => {  
            if (obj.orderId > maxid) maxid = obj.orderId;    
        });

        result.data.orderHistory.map(obj => {   
            if (obj.orderId == maxid) maxobj = obj;    
        });

        state.currentId = maxobj.orderId;
        commit('UPDATE_ORDER_HISTORY', result.data.orderHistory);
      }).catch(({ response }) => {
      });
    } else {
      axios.post('https://api.swiftapp.ml', 
        {
          "requestType": "updateOrder",
          "token": sessionStorage.getItem('authToken'),
          "orderId": state.currentId,
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
        console.log(result.data)
        return result.data
      }).catch(({ response }) => {
      });
  },

  submitRating({commit}, ratingObject) {
    console.log(ratingObject.ratings)
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
          // return result.data
          console.log(yay)
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
    console.log(data)
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

    var maxid = 0;
    var maxobj = null;

    orderHistory.map(obj => {  
        if (obj.orderId > maxid) maxid = obj.orderId;    
    });

    orderHistory.map(obj => {   
        if (obj.orderId == maxid) maxobj = obj;    
    });

    if (maxobj != null) {
      console.log("SET-UP")
      console.log(maxobj)

      let itemsOrdered = [];
      for (let i = 0; i < maxobj.items.length; i++) {
        let data = {
          "menuItemId": maxobj.items[i].menuItemId,
          "itemTotal": maxobj.items[i].itemTotal,
          "quantity": maxobj.items[i].quantity,
          "orderSelections": {
            "selections": maxobj.items[i].orderSelections
          }
        };
        itemsOrdered[i] = data;
      }

      // console.log("table")
      // console.log(this.getters['CustomerStore/getCheckedInTableId'])

      let data = {
        // "orderInfo": {
          "restaurantId": maxobj.restaurantId,
          "tableId": this.getters['CustomerStore/getCheckedInTableId'],
          "employeeId": 6,
          "waiterTip": 0,
          "orderItems": itemsOrdered
        // }
      }
      // console.log("NEW OLD")
      // console.log(data.orderItems)

      state.orderedItems = data;

      // console.log(state.orderedItems.orderItems)
    }
    

  },

  CLEAR_ORDER(state) {
    state.orderInfo = {}
  },

  UPDATE_ORDER(state) {
    
  },

  ADD_ITEM_TO_ORDER(state, orderItemInfo) {
    // console.log("ITEM TO ORDER:")
    // console.log(orderItemInfo)
    let empty = Object.keys(state.orderInfo).length === 0 && state.orderInfo.constructor === Object
    if (!empty) {
      for (let i = 0; i < orderItemInfo.orderInfo.orderItems.length; i++)
        state.orderInfo.orderItems.push(orderItemInfo.orderInfo.orderItems[i])
    } else
      state.orderInfo = orderItemInfo.orderInfo;
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
      console.log(obj)
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
    state.orderInfo = {}

    console.log("orderinfo")
    console.log(this.getters['OrderStore/getOrderInfo'])
    console.log("ordered")
    console.log(this.getters['OrderStore/getOrderedItems'])

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

