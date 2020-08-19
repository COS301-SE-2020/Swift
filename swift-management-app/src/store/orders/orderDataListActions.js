import axios from "@/axios.js"
import orderDataListGetters from "./orderDataListGetters";

export default {
  listOrders({
    commit
  }, payload) {
    axios.post('https://api.swiftapp.ml', {
      "requestType": "listOrders",
      "token": payload.authKey,
      "restaurantId": 1,
      "getAllOrders": false
    }).then(result => {

      result.data.orders.forEach(function (order) {
        var date = new Date(order.orderDateTime);
        var orderItem = {
          orderId: order.orderId,
          tableNumber: order.tableNumber,
          timePlaced: date.toLocaleTimeString(),
          employeeAssigned: order.employeeName + " " + order.employeeSurname,
          orderProgress: order.orderStatus,
          orderTotal: order.orderDetails.orderTotal.toFixed(2),
          items: []
        }
        let menuItemsAdded = false;
        order.orderDetails.items.forEach(function (menuItem) {
          menuItemsAdded = true;
          orderItem.items.push({
            menuItemId: menuItem.menuItemId,
            menuItemName: menuItem.menuItemName,
            menuItemDescription: menuItem.menuItemDescription,
            menuItemPrice: menuItem.price,
            menuItemQty: menuItem.quantity,
            menuItemProgress: 0
          });
        });
        // console.log(orderItem)
        if (menuItemsAdded)
          commit('ADD_ITEM', orderItem);
      });
    }).catch(({
      response
    }) => {});
  },
  increaseItemPercentage({
    commit
  }, payload) {
    //update API here
    axios.post('https://api.swiftapp.ml', {
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