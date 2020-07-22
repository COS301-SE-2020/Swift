import axios from "@/axios.js"
import orderDataListGetters from "./orderDataListGetters";

export default {
  listOrders({ commit }, data) {
    axios.post('https://api.swiftapp.ml',
      {
        "requestType": "listOrders",
        "token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFTdG5aZldTLS12RVFna1owYlhaWHo1TXd4WmNrSUJadHBrdVJvbzgtRkhoRDl4NGF2cm9PbExZN2V6blFkdXI2UXVUZUZ3bHBXRFhxUk5rei1ZeDk5WVQiLCJ5IjoiQWVPQXc5d3UxeTBfUjVNNll0WE44a19vZi1hLVFUNUVtOEpZUTU4eURJYmhtMnpIdFAyc3N4b0tjZXNkOFpIRUh2Q2xacFIwSFlFYWt6QnFNTWhac3VJNiJ9fQ..egod4OZOuzlZ2Nm_wxJ6Ug.LLRKt4oeqx0SCFBcpftHqVlq4C20-U_7CRV-3GCMHrVOMlE1PpHG26hsmmM2LK5-HOsdciAeANbdB2BosHOoia9JKyey6K7dlM3jBgery5PmgEuYU_pVMNtND4wQLSjpp7NDn18UkMklblY-6NoNrsuQwN6px2FR1m0k3qukAO0_lepMQZIAXJwqq0v49rP9RoONtu6OiuyacpoxFIbRlLhohYYblyEitsVY3_uSylTWvFXsh238uTtlWGrqnJCd3TDznnd7btq-HqLHO9P3ux0b9vgWVa0f0RFDe0KTQS2kKtQl8XLaRkap_m4cuaN9I5E2L_2mpbhhCCGyZctgdx6C45npnOCGNJpJPNuYZLrrZJT6HI0-QI6kA-OAhquNSAE-g_v67Xsa5W-9N2C0t0kXcfoyx5y3c7KP7sQgDOA6x0vM1i6-lX5paqK6qoX6LhtS5e_565Yml37g5dBduyZ9MFuTsn4X7nz8d0UEJnlYPaLtJs6ZxUav1mA_i8KbIz3UxFbcuChPuM8Ctaw4eRRw04Y2Tbztb6xRaXLaId-yy7pjYNEoNOK94CpRRVYGyfjumfgLfvGfThDmLn20T2r27RlNax3iiieRbHyYU1cg6VgtVZFmDuN0GLL21SbeNvgyCeFCltPIsAbzijHWlQ.1Veec0SDpY8a8CBoD-5kgQ",
        "restaurantId": 1,
        "getAllOrders": false
      }
    ).then(result => {

    //  console.log(result);

      

      result.data.orders.forEach(function (order) {
        var orderItem = {
          orderId : order.orderId,
          tableNumber : order.tableNumber,
          timePlaced : order.orderDateTime,
          employeeAssigned : order.employeeName + " " + order.employeeSurname,
          orderProgress : 0,
          orderTotal : order.orderDetails.orderTotal.toFixed(2),
          items: []
        }
        order.orderDetails.items.forEach(function (menuItem) {
          orderItem.items.push({
            menuItemName : menuItem.menuItemName,
            menuItemDescription : menuItem.menuItemDescription,
            menuItemPrice : menuItem.price,
            menuItemQty : menuItem.quantity,
            menuItemStatus : "Order Placed"
          });
        });
    //    console.log(JSON.stringify(orderItem));
        commit('ADD_ITEM', orderItem);
      });
    }).catch(({ response }) => {
    });
  }, 
}
