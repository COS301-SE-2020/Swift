export default {
  SET_ORDERS_OBJECT(state, orders) {
    state.orders = orders;
    state.orders.sort((a, b) => (a.orderDateTime < b.orderDateTime) ? 1 : -1)
  },
  //this might not be absolutely nececarry - can pull from API
  INC_MENU_ITEM_PERC(state, orderId, itemId, percentage) {
    var orders = state.orders;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].orderId === orderId) {
        var items = orders[j].items;
        for (var j = 0; j < items.length; j++) {
          if (items[i].menuItemId == itemId) {
            state.orders[i].items[j].menuItemProgress = percentage;
          }
        }
      }
    }
  }
}