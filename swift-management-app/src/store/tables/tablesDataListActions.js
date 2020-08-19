import axios from "@/axios.js"
import {
  resolve
} from "core-js/fn/promise";

export default {
  listTables({
    commit
  }, payload) {
    axios.post('https://api.swiftapp.ml', {
      "requestType": "getTableStatus",
      "includeProfileImage": false,
      "token": payload.authKey,
      "restaurantId": 37,
    }).then(response => {
      console.log(response);
      if (response.data.result.length == 0) {
        commit('SET_TABLE_OBJECT', []);
      } else commit('SET_TABLE_OBJECT', response.data.result);
    }).catch(({
      response
    }) => {});
  },
  addTable({
    commit
  }, payload) {
    return new Promise((resolve, reject) => {
      axios.post('https://api.swiftapp.ml', {
        "requestType": "createTable",
        "token": payload.authKey,
        "restaurantId": 37,
        "tableNumber": payload.tableNum,
        "seatCount": payload.tableSeats
      }).then(result => {
        //TODO: Add notification for successful table add
        //TODO: Check that same table doesn't exist
        console.log(result);
        resolve(result);
      }).catch(({
        response
      }) => {
        resolve(response);
        console.log(response)
      });
    });
  }
}