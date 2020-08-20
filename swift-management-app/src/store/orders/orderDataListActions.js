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
      "getAllOrders": true
    }).then(response => {
      console.log("ORDERS", response);
      commit('SET_ORDERS_OBJECT', response.data.orders);
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
      "menuItemId": payload.menuItemId,
      "percentage": Math.ceil(payload.percentage)
    }).then(result => {
      console.log(result);
    }).catch(({
      response
    }) => {
      console.log(response);
    });

  }
}