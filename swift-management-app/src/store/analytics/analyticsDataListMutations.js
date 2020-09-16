var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
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
        var count = 0;

        //Counter (date filtering)
        state.currentCustomers.series[0].data.push(count)

        var today = new Date().setHours(0, 0, 0, 0);
        for (var i = 0; i < customerHistory.length-1; i++) {
            var dataPointDate = new Date(customerHistory[i][0]) 
            if ((today < dataPointDate)) {
                if (customerHistory[i][1] === "checkin")
                count += customerHistory[i][2];
                else if (customerHistory[i][1] === "checkout")
                count -= customerHistory[i][2];

                if (count < 0) count = 0;
                state.currentCustomers.series[0].data.push(count)
            }
        }
        //ensure current count reflects on graph
        state.currentCustomers.series[0].data.push(state.currentCustomers.analyticsData.count)


        //Graph (no date filtering)
        state.customerCount.series[0].data = [];
        state.customerCount.series[1].data = [];
        state.customerCount.series[2].data = [];

        for (var i = 0; i < customerHistory.length; i++) {
            var checkInCount = 0;
            var checkOutCount = 0;
            var dataPointDate = new Date(customerHistory[i][0]);

            if (customerHistory[i][1] === "checkin")
                checkInCount += customerHistory[i][2]
            else if (customerHistory[i][1] === "checkout")
                checkOutCount -= customerHistory[i][2];

            state.customerCount.series[0].data.push(checkInCount);
            state.customerCount.series[1].data.push(checkOutCount);
            state.customerCount.series[2].data.push(checkInCount-checkOutCount);
            state.customerCount.chartOptions.xaxis.categories.push(dataPointDate.toISOString())
        }
        console.log(state.customerCount)
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
            if (new Date(tableHistory[i][0]) > new Date().setHours(0, 0, 0, 0)) {
                var tableOccupancyCount = tableHistory[i][2] - tableHistory[i][3];
                state.availableTables.series[0].data.push(tableOccupancyCount);
            }
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
            state.menuDistribution.chartOptions.labels.push(topMenu[i][0])
            state.menuDistribution.series.push(topMenu[i][1])
        }
    },
    SET_REVENUE_DATA(state, payload) {
        var now = new Date()
        var revData = payload.obj;
        var prevMonth = payload.month - 1;
        if (prevMonth < 0) prevMonth = 11;
        var thisMonthTotal = 0;
        var lastMonthTotal = 0;
        state.revenueData.series[0].data = [];
        state.revenueData.series[1].data = [];

        for (var i = 0; i < revData.length; i++) {
            var startDate = new Date(now.getFullYear(), payload.month, 1);
            var endDate = new Date(now.getFullYear(), payload.month + 1, 0);
            var prevStartDate = new Date(now.getFullYear(), prevMonth, 1);
            var prevEndDate = new Date(now.getFullYear(), prevMonth + 1, 0);
            var dataPointDate = new Date(revData[i][0]);

            if (dataPointDate > startDate && dataPointDate < endDate) {
                state.revenueData.series[0].data.push(revData[i][1])
                thisMonthTotal += revData[i][1];
            } else if (dataPointDate > prevStartDate && dataPointDate < prevEndDate) {
                state.revenueData.series[1].data.push(revData[i][1])
                lastMonthTotal += revData[i][1];
            }
        }
        state.revenueData.analyticsData.thisMonth = thisMonthTotal;
        state.revenueData.analyticsData.lastMonth = lastMonthTotal;
    },

    SET_TOP_REVENUE_MENU_ITEMS(state, topMenuItems) {
        state.topSellingItems = [];
        var listLength = topMenuItems.length;
        if (topMenuItems.length > 4)
            listLength = 4
        for (var i = 0; i < listLength; i++) {
            var tableObject = {};
            tableObject["name"] = topMenuItems[i][0];
            tableObject["totalIncome"] = (topMenuItems[i][1] * topMenuItems[i][2]).toFixed(2);
            tableObject["ratio"] = (topMenuItems[i][3] * 100).toFixed(2);
            tableObject["growthPerc"] = (topMenuItems[i][3] * 100 - topMenuItems[i][5] * 100).toFixed(2);
            state.topSellingItems.push(tableObject);
        }
    },
    SET_AVG_ORDER_PRICE(state, avgOrderPrices) {
        state.avgOrderPrice.series[0].data = [];
        state.avgOrderPrice.chartOptions.xaxis.categories = [];
        var now = new Date()
        var beginningOfYear = new Date(now.getFullYear(), 0, 1)
        for (var i = 0; i < avgOrderPrices.length; i++) {
            var dataPointDate = new Date(avgOrderPrices[i][0])
            if (dataPointDate > beginningOfYear) {
                state.avgOrderPrice.series[0].data.push(avgOrderPrices[i][1].toFixed(0));
                state.avgOrderPrice.chartOptions.xaxis.categories.push(months[dataPointDate.getMonth()]);
            }

        }
    },
    SET_MENU_REVENUE(state, menuRevenue) {
        console.log(menuRevenue)
        state.incomeByMenu.series = []
        state.incomeByMenu.chartOptions.xaxis.categories = [];
        var now = new Date()
        var beginningOfYear = new Date(now.getFullYear(), 0, 1)
        for (var i = 0; i < menuRevenue.length; i++) {
            var dataPointDate = new Date(menuRevenue[i][0])
            if (dataPointDate > beginningOfYear) {
                var existing = false;
                for (var j = 0; j < state.incomeByMenu.series.length; j++) {
                    if (state.incomeByMenu.series[j].name === menuRevenue[i][1]) {
                        existing = true;
                        state.incomeByMenu.series[j].data.push(menuRevenue[i][2])
                    }
                }
                if (!existing) {
                    var dataPoint = {};
                    dataPoint["name"] = menuRevenue[i][1];
                    dataPoint["data"] = [];
                    dataPoint.data.push(menuRevenue[i][2]);
                    state.incomeByMenu.series.push(dataPoint);
                }
                if (state.incomeByMenu.chartOptions.xaxis.categories.indexOf(months[dataPointDate.getMonth()]) < 0)
                    state.incomeByMenu.chartOptions.xaxis.categories.push(months[dataPointDate.getMonth()]);
            }
        }
    },


}