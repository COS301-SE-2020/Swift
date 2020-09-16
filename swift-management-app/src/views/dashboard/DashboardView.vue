<template>
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
          <span>Timeframe: Today</span>
          <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
        </span>
      </vs-button>
      <vs-dropdown-menu>
        <vs-dropdown-item>Today</vs-dropdown-item>
        <vs-dropdown-item>This Week</vs-dropdown-item>
        <vs-dropdown-item>This Month</vs-dropdown-item>
        <vs-dropdown-item>This Year</vs-dropdown-item>
        <vs-dropdown-item>This All Time</vs-dropdown-item>
      </vs-dropdown-menu>
    </vs-dropdown>
    <div class="vx-row">
      <div class="vx-col w-full md:w-1/3 mb-base">
        <vx-card title="Top Menu Items">
          <div v-for="(menuItem, index) in topItems" :key="menuItem.id" :class="{'mt-4': index}">
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
            <vs-progress :percent="menuItem.ratio"></vs-progress>
          </div>
        </vx-card>
      </div>
      <div class="vx-col md:w-1/3 w-full mb-base">
        <vx-card title="Menu Popularity">
          <vue-apex-charts
            type="donut"
            height="310"
            :options="menuDistribution.chartOptions"
            :series="menuDistribution.series"
          ></vue-apex-charts>
        </vx-card>
      </div>

      <div class="vx-col w-full md:w-1/3 mb-base">
        <vx-card title="Orders Completed Goal">
          <!-- CHART -->
          <template slot="no-body">
            <div class="mt-10">
              <vue-apex-charts
                type="radialBar"
                height="240"
                :options="goalOverviewRadialBar.chartOptions"
                :series="goalOverviewRadialBar.series"
              />
            </div>
          </template>

          <!-- DATA -->
          <div class="flex justify-between text-center mt-6" slot="no-body-bottom">
            <div
              class="w-1/2 border border-solid d-theme-border-grey-light border-r-0 border-b-0 border-l-0"
            >
              <p class="mt-4">Completed</p>
              <p
                class="mb-4 text-3xl font-semibold"
              >{{ goalOverviewRadialBar.analyticsData.completed }}</p>
            </div>
            <div class="w-1/2 border border-solid d-theme-border-grey-light border-r-0 border-b-0">
              <p class="mt-4">Goal</p>
              <p class="mb-4 text-3xl font-semibold">{{ goalOverviewRadialBar.analyticsData.goal }}</p>
            </div>
          </div>
        </vx-card>
      </div>
    </div>

    <div class="vx-row">
      <div class="vx-col w-full">
        <vx-card title="Customer Count">
          <vue-apex-charts
            type="area"
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
    goalOverviewRadialBar() {
      if (this.$store.state.analytics) {
        return this.$store.state.analytics.goalOverviewRadialBar;
      } else return null;
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
      this.$store.dispatch("analytics/dashboardOrderHistory", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
      this.$store.dispatch("analytics/dashboardActiveCustomerCount", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
      this.$store.dispatch("analytics/dashboardActiveCustomerHistory", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
      this.$store.dispatch("analytics/dashboardActiveWaiters", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
      this.$store.dispatch("analytics/dashboardAvailableTables", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
      });
      this.$store.dispatch("analytics/dashboardTableOccupancyHistory", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
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
};
</script>


