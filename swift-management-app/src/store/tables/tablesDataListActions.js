import axios from "@/axios.js"

export default {
  listTables({
    commit
  }, payload) {
    axios.post('https://api.swiftapp.ml', {
      "requestType": "getTableStatus",
      "includeProfileImage": false,
      "token": payload.authKey,
      "restaurantId": 35,
    }).then(response => {
      console.log(response);
      if (response.data.result.length == 0) {
        commit('SET_TABLE_OBJECT', "no tables");
      } else commit('SET_TABLE_OBJECT', response.data.result);
    }).catch(({
      response
    }) => {});
  },
  addTable({
    commit
  }, payload) {
    axios.post('https://api.swiftapp.ml', {
      "requestType": "createTable",
      "token": payload.authKey,
      "restaurantId": 35,
      "tableNumber": payload.tableNum,
      "seatCount": payload.tableSeats
    }).then(result => {
      //TODO: Add notification for successful table add
      //TODO: Check that same table doesn't exist
      console.log(result);
    }).catch(({
      response
    }) => {
      console.log(response)
    });
  },
}