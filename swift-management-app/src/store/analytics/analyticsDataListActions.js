import axios from "@/axios.js"


export default {
  dashboardActiveOrderCount({
    commit
  }, payload) {
    console.log(payload.restaurantId)
    axios.post(process.env.VUE_APP_MLURL, {
      "requestType": "dashboardActiveOrderCount",
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(result => {
      commit('SET_ACTIVE_ORDER_COUNT', result.data[0][0]);
    }).catch(({
      result
    }) => {
      console.log(result)
    });
  },
  dashboardOrderHistory({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_MLURL, {
      "requestType": "dashboardOrderHistory",
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(result => {
      commit('SET_ORDER_HISTORY', result.data);
    }).catch(({
      result
    }) => {
      console.log(result)
    });
  },
  dashboardActiveCustomerCount({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_MLURL, {
      "requestType": "dashboardActiveCustomerCount",
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(result => {
      commit('SET_ACTIVE_CUSTOMERS_COUNT', result.data[0][0]);
    }).catch(({
      result
    }) => {
      console.log(result)
    });
  },
  dashboardActiveCustomerHistory({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_MLURL, {
      "requestType": "dashboardActiveCustomerHistory",
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(result => {
      commit('SET_CUSTOMER_HISTORY', result.data);
    }).catch(({
      result
    }) => {
      console.log(result)
    });
  },
  dashboardActiveWaiters({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_MLURL, {
      "requestType": "dashboardActiveWaiters",
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(result => {
      commit('SET_ACTIVE_WAITER_COUNT', result.data);
    }).catch(({
      result
    }) => {
      console.log(result)
    });
  },
  dashboardAvailableTables({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_MLURL, {
      "requestType": "dashboardAvailableTables",
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(result => {
      commit('SET_AVAILABLE_TABLES_COUNT', result.data);
    }).catch(({
      result
    }) => {
      console.log(result)
    });
  },
  dashboardTableOccupancyHistory({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_MLURL, {
      "requestType": "dashboardTableOccupancyHistory",
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(result => {
      commit('SET_TABLE_OCUPANCY_HISTORY', result.data);
    }).catch(({
      result
    }) => {
      console.log(result)
    });
  },
  dashboardTopMenuItems({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_MLURL, {
      "requestType": "dashboardTopMenuItems",
      "startPeriod": payload.startPeriod,
      "endPeriod": 0,
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(result => {
      commit('SET_TOP_MENU_ITEMS', result.data);
    }).catch(({
      result
    }) => {
      console.log(result)
    });
  },
  dashboardTopMenus({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_MLURL, {
      "requestType": "dashboardTopMenus",
      "startPeriod": payload.startPeriod,
      "restaurantId": payload.restaurantId,
      "token": payload.authKey,
    }).then(result => {
      commit('SET_TOP_MENU', result.data);
    }).catch(({
      result
    }) => {
      console.log(result)
    });
  },
  statsRevenue({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_MLURL, {
        "requestType": "statsRevenue",
        "restaurantId": payload.restaurantId,
        "token": payload.authKey,
      }).then(result => {
        commit('SET_REVENUE_DATA', {
          obj: result.data,
          month: payload.month,
        });
        resolve(result);
      }).catch(({
        result
      }) => {
        console.log(result)
      });
    });
  },
  statsTopMenuItems({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_MLURL, {
        "requestType": "statsTopMenuItems",
        "startPeriod": payload.startPeriod,
        "endPeriod": payload.endPeriod,
        "restaurantId": payload.restaurantId,
        "token": payload.authKey,
      }).then(result => {
        commit('SET_TOP_REVENUE_MENU_ITEMS', result.data);
        resolve(result);
      }).catch(({
        result
      }) => {
        console.log(result)
      });
    });
  },
  statsAvgOrderPrice({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_MLURL, {
        "requestType": "statsAvgOrderPrice",
        "restaurantId": payload.restaurantId,
        "token": payload.authKey,
      }).then(result => {
        commit('SET_AVG_ORDER_PRICE', result.data);
        resolve(result);
      }).catch(({
        result
      }) => {
        console.log(result)
      });
    });
  },
  statsMenuRevenue({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.VUE_APP_MLURL, {
        "requestType": "statsMenuRevenue",
        "restaurantId": payload.restaurantId,
        "token": payload.authKey,
      }).then(result => {
        commit('SET_MENU_REVENUE', result.data);
        resolve(result);
      }).catch(({
        result
      }) => {
        console.log(result)
      });
    });
  },
}