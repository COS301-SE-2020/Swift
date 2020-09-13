<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Dashboard</h2>
      </div>
    </div>
    <h4 class="mb-2">Realtime</h4>
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
          v-if="currentOrders.analyticsData"
          icon="UserIcon"
          :statistic="currentOrders.analyticsData.count"
          statisticTitle="Customers Checked-In"
          :chartData="currentOrders.series"
          type="area"
          color="success"
        />
      </div>

      <div class="vx-col w-full sm:w-1/2 md:w-1/2 lg:w-1/4 xl:w-1/4 mb-base">
        <statistics-card-line
          v-if="currentOrders.analyticsData"
          icon="UsersIcon"
          :statistic="currentOrders.analyticsData.count"
          statisticTitle="Idle Employees"
          :chartData="currentOrders.series"
          color="warning"
          type="area"
        />
      </div>

      <div class="vx-col w-full sm:w-1/2 md:w-1/2 lg:w-1/4 xl:w-1/4 mb-base">
        <statistics-card-line
          v-if="currentOrders.analyticsData"
          icon="BookOpenIcon"
          :statistic="currentOrders.analyticsData.count"
          statisticTitle="Available Tables"
          :chartData="currentOrders.series"
          color="dark"
          type="area"
        />
      </div>
    </div>
    <h4 class="mb-2">Recently</h4>
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
      <div class="vx-col w-full md:w-1/4 lg:w-1/4 xl:w-1/4 mb-base">
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

      <div class="vx-col w-full md:w-3/4 lg:w-3/4 xl:w-/4">
        <vx-card title="Customer Count">
          <vue-apex-charts
            type="area"
            height="295"
            :options="CustomerCount.chartOptions"
            :series="CustomerCount.series"
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
    topItems() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.topItems;
      else return null;
    },
    CustomerCount() {
      if (this.$store.state.analytics) {
        return this.$store.state.analytics.CustomerCount;
      } else return null;
    },
  },
  created() {
    //check authtoken
    if (!analyticsData.isRegistered) {
      this.$store.registerModule("analytics", analyticsData);
      analyticsData.isRegistered = true;
    }
  },
  mounted() {
    this.isMounted = true;
  },
};
</script>


