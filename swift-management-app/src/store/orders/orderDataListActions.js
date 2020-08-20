import axios from "@/axios.js"
import orderDataListGetters from "./orderDataListGetters";

export default {
  listOrders({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "listOrders",
      "token": payload.authKey,
      "restaurantId": payload.currentRestaurantId,
      "getAllOrders": false
    }).then(response => {
      console.log(response);
      if (response.data.orders.length == 0) {
        commit('SET_ORDERS_OBJECT', []);
      } else commit('SET_ORDERS_OBJECT', response.orders);
    }).catch(({
      response
    }) => {});
  },
  increaseItemPercentage({
    commit
  }, payload) {
    //update API here
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "orderStatusUpdate",
      "token": payload.authKey,
      "orderId": payload.orderId,
      "percentage": Math.ceil(payload.percentage)
    }).then(result => {
      console.log(result);
    }).catch(({
      response
    }) => {
      console.log(response);
    });

    //TODO: Update Individual Menu Item either create API endpoint or store locally
    // commit('INC_MENU_ITEM_PERC', orderId, itemId, percentage);
  }
}