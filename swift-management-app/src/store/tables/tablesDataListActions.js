import axios from "@/axios.js"

export default {
  listTables({
    commit
  }, payload) {
    axios.post('https://api.swiftapp.ml', {
      "requestType": "getTableStatus",
      "token": payload.authKey,
      "restaurantId": 1,
    }).then(result => {
      console.log(result)
      result.data.result.forEach(function (table) {
        var tableItem = {
          tableId: table.tableId,
          tableNumber: table.tableNumber,
          numSeats: table.numSeats,
          checkedIn: table.checkedIn,
          qrcode: table.qrcode
        }
        console.log(tableItem);
        commit('ADD_ITEM', tableItem);
      });
    }).catch(({
      response
    }) => {});
  },
  addTable({
    commit
  }, {
    payload
  }) {
    axios.post('https://api.swiftapp.ml', {
      "requestType": "createTable",
      "token": payload.authKey,
      "restaurantId": 1,
      "tableNumber": payload.tableNum,
      "seatCount": payload.tableSeats
    }).then(result => {
      //TODO: Add notification for successfull table add
    }).catch(({
      response
    }) => {
      console.log(response)
    });
  },
}