export default {
  ADD_ITEM(state, item) {
    let exists = false;
    state.tables.forEach(function (table) {
      if (item.tableId === table.tableId)
        exists = true;
    });

    if (!exists){
      state.tables.unshift(item);
      state.tables.sort((a, b) => (parseInt(a.tableNumber) > parseInt(b.tableNumber)) ? 1 : -1)
    }  
  },
}
