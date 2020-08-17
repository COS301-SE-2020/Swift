export default {
  ADD_ITEM(state, item) {
    let exists = false;
    state.menuItems.forEach(function (menuItem) {
      if (item.name === menuItem.name)
        exists = true;
    });

    if (!exists)
      state.menuItems.unshift(item)
  },
  SET_RESTAURANT_OBJECT(state, restaurantObject) {
    state.restaurantObject = restaurantObject;
  },
  SET_menuItems(state, menuItems) {
    state.menuItems = menuItems
  },
  // SET_LABELS(state, labels) {
  //   state.eventLabels = labels
  // },
  UPDATE_PRODUCT(state, product) {
      const productIndex = state.menuItems.findIndex((p) => p.id == product.id)
      Object.assign(state.menuItems[productIndex], product)
  },
  REMOVE_ITEM(state, itemId) {
      const ItemIndex = state.menuItems.findIndex((p) => p.id == itemId)
      state.menuItems.splice(ItemIndex, 1)
  },
}
