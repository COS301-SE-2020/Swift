<template :key="myDashboard">
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Dashboard</h2>
      </div>
    </div>
    <h4 class="mb-2">Realtime Statistics</h4>
    <div class="vx-row">
      <div class="vx-col w-full sm:w-1/2 md:w-1/2 lg:w-1/4 xl:w-1/4 mb-base">
        <statistics-card-line
          ref="counterCurrentOrders"
          v-if="currentOrders.analyticsData"
          icon="ShoppingCartIcon"
          :statistic="currentOrders.analyticsData.count"
          statisticTitle="Active Orders"
          :chartData="currentOrders.series"
          type="area"
        />
      </div>

      <div class="vx-col w-full sm:w-1/2 md:w-1/2 lg:w-1/4 xl:w-1/4 mb-base">
        <statistics-card-line
          ref="counterCurrentCustomers"
          v-if="currentCustomers.analyticsData"
          icon="UserIcon"
          :statistic="currentCustomers.analyticsData.count"
          statisticTitle="Customers Checked-In"
          :chartData="currentCustomers.series"
          type="area"
          color="success"
        />
      </div>

      <div class="vx-col w-full sm:w-1/2 md:w-1/2 lg:w-1/4 xl:w-1/4 mb-base">
        <statistics-card-line
          ref="counterActiveWaiters"
          v-if="activeWaiters.analyticsData"
          icon="UsersIcon"
          :statistic="getActiveWaiterCount(activeWaiters)"
          statisticTitle="Idle Employees"
          :chartData="activeWaiters.series"
          color="warning"
          type="area"
        />
      </div>

      <div class="vx-col w-full sm:w-1/2 md:w-1/2 lg:w-1/4 xl:w-1/4 mb-base">
        <statistics-card-line
          ref="counterAvailableTables"
          v-if="availableTables.analyticsData"
          icon="BookOpenIcon"
          :statistic="getAvailableTableCount(availableTables)"
          statisticTitle="Available Tables"
          :chartData="availableTables.series"
          color="dark"
          type="area"
        />
      </div>
    </div>
    <h4 class="mb-2">Recent Insights</h4>
    <vs-dropdown class="mb-4 mr-4">
      <vs-button type="filled">
        <span class="flex items-center">
          <span>Timeframe: {{ timePeriod }}</span>
          <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
        </span>
      </vs-button>
      <vs-dropdown-menu>
        <vs-dropdown-item @click="timePeriod = 'Today'">Today</vs-dropdown-item>
        <vs-dropdown-item @click="timePeriod = 'This Week'">This Week</vs-dropdown-item>
        <vs-dropdown-item @click="timePeriod = 'This Month'">This Month</vs-dropdown-item>
        <vs-dropdown-item @click="timePeriod = 'This Year'">This Year</vs-dropdown-item>
        <vs-dropdown-item @click="timePeriod = 'All Time'">All Time</vs-dropdown-item>
      </vs-dropdown-menu>
    </vs-dropdown>
    <div class="vx-row">
      <div class="vx-col w-full md:w-1/3 mb-base">
        <vx-card title="Top Menu Items">
          <div v-for="(menuItem, index) in topItems" :key="index" :class="{'mt-4': index}">
            <div class="flex justify-between">
              <div class="flex flex-col">
                <span class="mb-1">{{ menuItem.name }}</span>
                <h4>{{ menuItem.ratio }}%</h4>
              </div>
              <div class="flex flex-col text-right">
                <span class="flex -mr-1">
                  <h5 class="mr-1">{{ menuItem.growthPerc }}%</h5>
                  <feather-icon
                    :icon=" menuItem.growthPerc < 0 ? 'ArrowDownIcon' : 'ArrowUpIcon'"
                    :svgClasses="[menuItem.growthPerc < 0 ? 'text-danger' : 'text-success'  ,'stroke-current h-4 w-4 mb-1 mr-1']"
                  ></feather-icon>
                </span>
              </div>
            </div>
            <vs-progress :percent="parseFloat(menuItem.ratio)"></vs-progress>
          </div>
        </vx-card>
      </div>
      <div class="vx-col md:w-1/3 w-full mb-base">
        <vx-card title="Menu Popularity">
          <vue-apex-charts
            ref="menuPopularityChart"
            type="donut"
            height="310"
            :options="menuDistribution.chartOptions"
            :series="menuDistribution.series"
          ></vue-apex-charts>
        </vx-card>
      </div>
        <div class="vx-col md:w-1/3 w-full mb-base">
        <vx-card title="Monthly Menu">
          <vue-apex-charts
            ref="menuPopularityMonthly"
            type="bar"
            height="300"
            :options="menuPopularityMonthly.chartOptions"
            :series="menuPopularityMonthly.series"
          ></vue-apex-charts>
        </vx-card>
      </div>
    </div>

    <div class="vx-row">
      <div class="vx-col w-full">
        <vx-card title="Customer Count">
          <vue-apex-charts
            ref="largeCustomerCount"
            type="bar"
            height="295"
            :options="customerCount.chartOptions"
            :series="customerCount.series"
          ></vue-apex-charts>
        </vx-card>
      </div>
    </div>
  </div>
</template>
<script>
import VueApexCharts from "vue-apexcharts";
import analyticsData from "@/store/analytics/analyticsDataList.js";
import StatisticsCardLine from "@/components/statistics-cards/StatisticsCardLine.vue";

export default {
  components: {
    VueApexCharts,
    StatisticsCardLine,
  },
  data() {
    return {
      timePeriod: "All Time",
      myDashboard: 1,
    };
  },
  computed: {
    currentOrders() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.currentOrders;
      else return null;
    },
    currentCustomers() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.currentCustomers;
      else return null;
    },
    activeWaiters() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.activeWaiters;
      else return null;
    },
    availableTables() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.availableTables;
      else return null;
    },
    topItems() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.topItems;
      else return null;
    },
    customerCount() {
      if (this.$store.state.analytics) {
        return this.$store.state.analytics.customerCount;
      } else return null;
    },
    menuDistribution() {
      if (this.$store.state.analytics) {
        return this.$store.state.analytics.menuDistribution;
      } else return null;
    },
     menuPopularityMonthly() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.menuPopularityMonthly;
      else return null;
    },
    restaurantObject() {
      //if restaurant has been loaded before menu - use that
      if (this.$store.state.menuList)
        return this.$store.state.menuList.restaurantObject;
      else if (this.$store.state.myRestaurants) {
        for (var i = 0; i < this.$store.state.myRestaurants.length; i++)
          if (
            this.$store.state.myRestaurants[i].restaurantId ==
            this.getCurrentRestaurantId()
          ) {
            return this.$store.state.myRestaurants[i];
          }
      } else {
        return null;
      }
    },
  },
  methods: {
    getActiveWaiterCount(activeWaiters) {
      var active =
        activeWaiters.analyticsData.count.totalWaiters -
        activeWaiters.analyticsData.count.occupiedWaiters;
      if (active) return active;
      else return 0;
    },
    getAvailableTableCount(availableTables) {
      var available =
        availableTables.analyticsData.count.totalTables -
        availableTables.analyticsData.count.occupiedTables;
      if (available) return available;
      else return 0;
    },
    loadDashboard() {
      this.$store.dispatch("analytics/dashboardActiveOrderCount", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
      this.$store
        .dispatch("analytics/dashboardOrderHistory", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
        })
        .then((response) => {
          this.$refs.counterCurrentOrders.$refs.apexChart.updateSeries(
            this.$store.state.analytics.currentOrders.series
          );
        });
      this.$store.dispatch("analytics/dashboardActiveCustomerCount", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
      this.$store
        .dispatch("analytics/dashboardActiveCustomerHistory", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
        })
        .then(() => {
          this.$refs.counterCurrentCustomers.$refs.apexChart.updateSeries(
            this.$store.state.analytics.currentCustomers.series
          );
          this.$refs.largeCustomerCount.updateOptions(
            this.$store.state.analytics.customerCount.chartOptions
          );
          this.$refs.largeCustomerCount.updateSeries(
            this.$store.state.analytics.customerCount.series
          );
        });
      this.$store.dispatch("analytics/dashboardActiveWaiters", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
      this.$store.dispatch("analytics/dashboardAvailableTables", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
      this.$store
        .dispatch("analytics/dashboardTableOccupancyHistory", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
        })
        .then(() => {
          this.$refs.counterAvailableTables.$refs.apexChart.updateSeries(
            this.$store.state.analytics.availableTables.series
          );
        });
      this.$store
        .dispatch("analytics/dashboardTopMenuItems", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
          startPeriod: 999999,
        })
        .then(() => {
          this.$refs.menuPopularityChart.updateOptions(
            this.$store.state.analytics.menuDistribution.chartOptions
          );
          this.$refs.menuPopularityChart.updateSeries(
            this.$store.state.analytics.menuDistribution.series
          );
        });
      this.$store.dispatch("analytics/dashboardTopMenus", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
        startPeriod: 999999,
      });

       this.$store
        .dispatch("analytics/statsMenuRevenue", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
        })
        .then(() => {
          this.$refs.menuPopularityMonthly.updateSeries(this.$store.state.analytics.menuPopularityMonthly.series);
          this.$refs.menuPopularityMonthly.updateOptions(this.$store.state.analytics.menuPopularityMonthly.chartOptions);
        });

    },
  },
  created() {
    //check authtoken
    if (!analyticsData.isRegistered) {
      this.$store.registerModule("analytics", analyticsData);
      analyticsData.isRegistered = true;
    }
    this.loadDashboard();
  },
  mounted() {
    this.isMounted = true;
  },
  watch: {
    timePeriod(val) {
      var start = 1;
      var now = new Date();
      switch (val) {
        case "Today":
          start = 1;
          break;
        case "This Week":
          start = now.getDay();
          break;
        case "This Month":
          start = now.getDate();
          break;
        case "This Year":
          var beginOfYear = new Date(now.getFullYear(), 0, 0);
          var Difference = now - beginOfYear;
          var oneDay = 1000 * 60 * 60 * 24;
          var daysIntoYear = Math.floor(Difference / oneDay);
          start = daysIntoYear;
          break;
        case "All Time":
          start = 999999;
          break;

        default:
          break;
      }
      this.$store.dispatch("analytics/dashboardTopMenuItems", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
        startPeriod: start,
      });
      this.$store
        .dispatch("analytics/dashboardTopMenus", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
          startPeriod: start,
        })
        .then(() => {
          this.$refs.menuPopularityChart.updateSeries(
            this.$store.state.analytics.menuDistribution.series
          );
          this.$refs.menuPopularityChart.updateOptions(
            this.$store.state.analytics.menuDistribution.chartOptions
          );
        });
    },
  },
};
</script>


