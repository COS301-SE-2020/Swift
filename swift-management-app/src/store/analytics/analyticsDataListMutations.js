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

        //Counter (date filtering)
        for (var i = 0; i < customerHistory.length; i++) {
            // if(new Date(customerHistory[i][0]) > new Date().setHours(0,0,0,0)) //today
            if (customerHistory[i][1] === "checkin")
                customerCount++;
            else if (customerHistory[i][1] === "checkout")
                customerCount--;

            state.currentCustomers.series[0].data.push(customerCount)
        }

        var checkInCount = 0;
        var checkOutCount = 0;

        state.customerCount.series[0].data = [];
        state.customerCount.series[1].data = [];
        state.customerCount.series[2].data = [];

        //Graph (no date filtering)
        for (var i = 0; i < customerHistory.length; i++) {
            if (customerHistory[i][1] === "checkin")
                checkInCount++;
            else if (customerHistory[i][1] === "checkout")
                checkOutCount--;

            state.customerCount.series[0].data.push(checkInCount);
            state.customerCount.series[1].data.push(checkOutCount);
            state.customerCount.series[2].data.push(checkInCount-checkOutCount);
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
    SET_TOP_MENU_ITEMS(state, topMenuItems) {
        state.topItems = [];
        var listLength = topMenuItems.length;
        if (topMenuItems.length > 4)
            listLength = 4
        for (var i = 0; i < listLength; i++) {
            var tableObject = {};
            tableObject["name"] = topMenuItems[i][0];
            tableObject["ratio"] = (topMenuItems[i][2] * 100).toFixed(2);
            tableObject["growthPerc"] = (topMenuItems[i][2] * 100 - topMenuItems[i][4] * 100).toFixed(2);
            state.topItems.push(tableObject);
        }
    },
    SET_TOP_MENU(state, topMenu) {
        state.menuDistribution.series = []
        state.menuDistribution.chartOptions.labels = []
        var listLength = topMenu.length;
        if (topMenu.length > 5)
            listLength = 5
        for (var i = 0; i < listLength; i++) {
            state.menuDistribution.chartOptions.labels .push(topMenu[i][0])
            state.menuDistribution.series.push(topMenu[i][1]) 
        }
    },
}