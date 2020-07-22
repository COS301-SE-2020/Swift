export default {
  ADD_ITEM(state, item) {
    if(! state.orders.includes(item))
      state.order.unshift(item)
  },
}
