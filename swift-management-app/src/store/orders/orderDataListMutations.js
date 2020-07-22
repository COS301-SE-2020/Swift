export default {
  ADD_ITEM(state, item) {
    let exists = false;
    state.orders.forEach(function (order) {
      if (item.orderId === order.orderId)
        exists = true;
    });

    if (!exists)
      state.orders.unshift(item);

  },
  //this might not be absolutely nececarry - can pull from API
  INC_MENU_ITEM_PERC(state, orderId, itemId, percentage) {
    var orders = state.orders;
    for(var i = 0; i < orders.length; i++){
      if (orders[i].orderId === orderId){
        var items = orders[j].items;
        for(var j = 0; j < items.length; j++){
          if(items[i].menuItemId == itemId){
            state.orders[i].items[j].menuItemProgress = percentage;
          }
        }
      }
    }
}
}
