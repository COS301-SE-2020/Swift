import axios from "@/axios.js"
import {
  resolve
} from "core-js/fn/promise";

export default {
  listTables({
    commit
  }, payload) {
    axios.post(process.env.VUE_APP_BASEURL, {
      "requestType": "getTableStatus",
      "includeProfileImage": false,
      "token": payload.authKey,
      "restaurantId": payload.currentRestaurantId,
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
      axios.post(process.env.VUE_APP_BASEURL, {
        "requestType": "createTable",
        "token": payload.authKey,
        "restaurantId": payload.currentRestaurantId,
        "tableNumber": payload.tableNum,
        "seatCount": payload.tableSeats
      }).then(result => {
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