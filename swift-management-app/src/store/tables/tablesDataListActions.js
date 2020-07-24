import axios from "@/axios.js"

export default {
  listTables({ commit }, data) {
    axios.post('https://api.swiftapp.ml',
      {
        "requestType": "getTableStatus",
        "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFTdG5aZldTLS12RVFna1owYlhaWHo1TXd4WmNrSUJadHBrdVJvbzgtRkhoRDl4NGF2cm9PbExZN2V6blFkdXI2UXVUZUZ3bHBXRFhxUk5rei1ZeDk5WVQiLCJ5IjoiQWVPQXc5d3UxeTBfUjVNNll0WE44a19vZi1hLVFUNUVtOEpZUTU4eURJYmhtMnpIdFAyc3N4b0tjZXNkOFpIRUh2Q2xacFIwSFlFYWt6QnFNTWhac3VJNiJ9fQ..egod4OZOuzlZ2Nm_wxJ6Ug.LLRKt4oeqx0SCFBcpftHqVlq4C20-U_7CRV-3GCMHrVOMlE1PpHG26hsmmM2LK5-HOsdciAeANbdB2BosHOoia9JKyey6K7dlM3jBgery5PmgEuYU_pVMNtND4wQLSjpp7NDn18UkMklblY-6NoNrsuQwN6px2FR1m0k3qukAO0_lepMQZIAXJwqq0v49rP9RoONtu6OiuyacpoxFIbRlLhohYYblyEitsVY3_uSylTWvFXsh238uTtlWGrqnJCd3TDznnd7btq-HqLHO9P3ux0b9vgWVa0f0RFDe0KTQS2kKtQl8XLaRkap_m4cuaN9I5E2L_2mpbhhCCGyZctgdx6C45npnOCGNJpJPNuYZLrrZJT6HI0-QI6kA-OAhquNSAE-g_v67Xsa5W-9N2C0t0kXcfoyx5y3c7KP7sQgDOA6x0vM1i6-lX5paqK6qoX6LhtS5e_565Yml37g5dBduyZ9MFuTsn4X7nz8d0UEJnlYPaLtJs6ZxUav1mA_i8KbIz3UxFbcuChPuM8Ctaw4eRRw04Y2Tbztb6xRaXLaId-yy7pjYNEoNOK94CpRRVYGyfjumfgLfvGfThDmLn20T2r27RlNax3iiieRbHyYU1cg6VgtVZFmDuN0GLL21SbeNvgyCeFCltPIsAbzijHWlQ.1Veec0SDpY8a8CBoD-5kgQ",
        "restaurantId": 1,
      }
    ).then(result => {
      console.log(result)
      result.data.result.forEach(function (table) {
        var tableItem = {
          tableId : table.tableId,
          tableNumber: table.tableNumber,
          numSeats: table.numSeats,
          status: table.status,
          qrcode: table.qrcode
        }
          console.log(tableItem);
          commit('ADD_ITEM', tableItem);
      });
    }).catch(({ response }) => {
    });
  },
  addTable({ commit }, {tableNum, tableSeats}) {
    axios.post('https://api.swiftapp.ml',
      {
        "requestType": "createTable",
        "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFTdG5aZldTLS12RVFna1owYlhaWHo1TXd4WmNrSUJadHBrdVJvbzgtRkhoRDl4NGF2cm9PbExZN2V6blFkdXI2UXVUZUZ3bHBXRFhxUk5rei1ZeDk5WVQiLCJ5IjoiQWVPQXc5d3UxeTBfUjVNNll0WE44a19vZi1hLVFUNUVtOEpZUTU4eURJYmhtMnpIdFAyc3N4b0tjZXNkOFpIRUh2Q2xacFIwSFlFYWt6QnFNTWhac3VJNiJ9fQ..egod4OZOuzlZ2Nm_wxJ6Ug.LLRKt4oeqx0SCFBcpftHqVlq4C20-U_7CRV-3GCMHrVOMlE1PpHG26hsmmM2LK5-HOsdciAeANbdB2BosHOoia9JKyey6K7dlM3jBgery5PmgEuYU_pVMNtND4wQLSjpp7NDn18UkMklblY-6NoNrsuQwN6px2FR1m0k3qukAO0_lepMQZIAXJwqq0v49rP9RoONtu6OiuyacpoxFIbRlLhohYYblyEitsVY3_uSylTWvFXsh238uTtlWGrqnJCd3TDznnd7btq-HqLHO9P3ux0b9vgWVa0f0RFDe0KTQS2kKtQl8XLaRkap_m4cuaN9I5E2L_2mpbhhCCGyZctgdx6C45npnOCGNJpJPNuYZLrrZJT6HI0-QI6kA-OAhquNSAE-g_v67Xsa5W-9N2C0t0kXcfoyx5y3c7KP7sQgDOA6x0vM1i6-lX5paqK6qoX6LhtS5e_565Yml37g5dBduyZ9MFuTsn4X7nz8d0UEJnlYPaLtJs6ZxUav1mA_i8KbIz3UxFbcuChPuM8Ctaw4eRRw04Y2Tbztb6xRaXLaId-yy7pjYNEoNOK94CpRRVYGyfjumfgLfvGfThDmLn20T2r27RlNax3iiieRbHyYU1cg6VgtVZFmDuN0GLL21SbeNvgyCeFCltPIsAbzijHWlQ.1Veec0SDpY8a8CBoD-5kgQ",
        "restaurantId": 1,
        "tableNumber" : tableNum,
        "seatCount" : tableSeats
      }
    ).then(result => {
      //TODO: Add notification for successfull table add
    }).catch(({ response }) => {
      console.log(response)
    });
  },
}
