export default {
    SET_ACTIVE_ORDER_COUNT(state, activeOrderCount) {
        state.currentOrders.analyticsData.count = activeOrderCount;
    },
    SET_ORDER_HISTORY(state, orderHistory) {
        state.currentOrders.series[0].data = [];
        for (var i = 0; i < orderHistory.length; i++) {
            // if(new Date(orderHistory[i][0]) > new Date().setHours(0,0,0,0)) //today
            state.currentOrders.series[0].data.push(orderHistory[i][1])
        }
    },
    SET_ACTIVE_CUSTOMERS_COUNT(state, activeCustomersCount) {
        state.currentCustomers.analyticsData.count = activeCustomersCount;
    },
    SET_CUSTOMER_HISTORY(state, customerHistory) {
        state.currentCustomers.series[0].data = [];
        var customerCount = 0;
        for (var i = 0; i < customerHistory.length; i++) {
            // if(new Date(customerHistory[i][0]) > new Date().setHours(0,0,0,0)) //today
            if (customerHistory[i][1] === "checkin")
                customerCount++;
            else if (customerHistory[i][1] === "checkout")
                customerCount--;

            state.currentCustomers.series[0].data.push(customerCount)
        }
    },
    SET_ACTIVE_WAITER_COUNT(state, activeWaiterCount) {
        state.activeWaiters.analyticsData.count = activeWaiterCount;
    },
    SET_AVAILABLE_TABLES_COUNT(state, availableTables) {
        state.availableTables.analyticsData.count = availableTables;
    },
    SET_TABLE_OCUPANCY_HISTORY(state, tableHistory) {
        state.availableTables.series[0].data = [];
        for (var i = 0; i < tableHistory.length; i++) {
            var tableOccupancyCount = tableHistory[i][2] - tableHistory[i][3];
            state.availableTables.series[0].data.push(tableOccupancyCount);
        }
    },


}