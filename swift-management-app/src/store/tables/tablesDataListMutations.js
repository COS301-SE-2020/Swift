export default {
  SET_TABLE_OBJECT(state, tables) {
    state.tables = tables;
    state.tables.sort((a, b) => (parseInt(a.tableNumber) > parseInt(b.tableNumber)) ? 1 : -1)
  },
}
