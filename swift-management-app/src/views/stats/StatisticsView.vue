<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Statistics</h2>
      </div>
    </div>
    <h4 class="mb-2">Financial Statistics</h4>
    <vs-dropdown class="mb-4 mr-4">
      <vs-button type="filled">
        <span class="flex items-center">
          <span>Month: {{ selectedMonth }}</span>
          <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
        </span>
      </vs-button>
      <vs-dropdown-menu>
        <vs-dropdown-item
          v-for="(index, month) in months"
          :key="index"
          @click="selectedMonth = months[month]"
        >{{ months[month] }}</vs-dropdown-item>
      </vs-dropdown-menu>
    </vs-dropdown>
    <div class="vx-row">
      <div class="vx-col w-full md:w-2/3 mb-base">
        <vx-card title="Revenue">
          <div slot="no-body" class="p-6 pb-0">
            <div class="flex" v-if="revenueData.analyticsData">
              <div class="mr-6">
                <p class="mb-1 font-semibold">{{ selectedMonth }}</p>
                <p class="text-3xl text-success">
                  <sup class="text-base mr-1">R</sup>
                  {{ revenueData.analyticsData.thisMonth.toLocaleString() }}
                </p>
              </div>
              <div>
                <p class="mb-1 font-semibold">{{ previousMonth }}</p>
                <p class="text-3xl">
                  <sup class="text-base mr-1">R</sup>
                  {{ revenueData.analyticsData.lastMonth.toLocaleString() }}
                </p>
              </div>
            </div>
            <vue-apex-charts
              ref="revenueChart"
              type="line"
              height="257"
              :options="revenueData.chartOptions"
              :series="revenueData.series"
            />
          </div>
        </vx-card>
      </div>
      <div class="vx-col w-full md:w-1/3 mb-base">
        <vx-card title="Top Selling Menu Items">
          <span v-if="topSellingItems.length == 0">No Data</span>
          <div
            v-for="(menuItem, index) in topSellingItems"
            :key="menuItem.id"
            :class="{'mt-4': index}"
          >
            <div class="flex justify-between">
              <div class="flex flex-col">
                <span class="mb-1">{{ menuItem.name }}</span>
                <h4>
                  R{{ menuItem.totalIncome }}
                  <span class="subText">({{ menuItem.ratio }}%)</span>
                </h4>
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
    </div>
    <div class="vx-row">
      <div class="vx-col md:w-1/2 w-full mb-base">
        <vx-card title="Average Order Price">
          <vue-apex-charts
            ref="avgOrderPriceChart"
            type="line"
            height="350"
            :options="avgOrderPrice.chartOptions"
            :series="avgOrderPrice.series"
          ></vue-apex-charts>
        </vx-card>
      </div>

      <div class="vx-col md:w-1/2 w-full mb-base">
        <vx-card title="Income By Menu">
          <vue-apex-charts
            ref="incomeByMenu"
            type="bar"
            height="350"
            :options="incomeByMenu.chartOptions"
            :series="incomeByMenu.series"
          ></vue-apex-charts>
        </vx-card>
      </div>
    </div>
  </div>
</template>
<script>
import VueApexCharts from "vue-apexcharts";
import analyticsData from "@/store/analytics/analyticsDataList.js";

export default {
  components: {
    VueApexCharts,
  },
  data() {
    return {
      selectedMonth: "January",
      months: [
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
      ],
    };
  },
  computed: {
    previousMonth() {
      var index = this.months.indexOf(this.selectedMonth) - 1;
      if (index == -1) index = 11;
      return this.months[index];
    },
    revenueData() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.revenueData;
      else return null;
    },
    avgOrderPrice() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.avgOrderPrice;
      else return null;
    },
    topSellingItems() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.topSellingItems;
      else return null;
    },
    incomeByMenu() {
      if (this.$store.state.analytics)
        return this.$store.state.analytics.incomeByMenu;
      else return null;
    },
  },
  methods: {
    loadStatistics() {
      this.$store
        .dispatch("analytics/statsRevenue", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
          month: new Date().getMonth(),
        })
        .then(() => {
          this.$refs.revenueChart.updateSeries([
            {
              name: "This Month",
              data: this.$store.state.analytics.revenueData.series[0].data,
            },
            {
              name: "Last Month",
              data: this.$store.state.analytics.revenueData.series[1].data,
            },
          ]);
        });
      this.$store.dispatch("analytics/statsTopMenuItems", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
        startPeriod: new Date().getDay(),
        endPeriod: 0,
      });
      this.$store
        .dispatch("analytics/statsAvgOrderPrice", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
        })
        .then(() => {
          this.$refs.avgOrderPriceChart.updateSeries([
            {
              name: "Average Price",
              data: this.$store.state.analytics.avgOrderPrice.series[0].data,
            },
          ]);
        });

      this.$store
        .dispatch("analytics/statsMenuRevenue", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
        })
        .then(() => {
          this.$refs.incomeByMenu.updateSeries(this.$store.state.analytics.incomeByMenu.series);
          this.$refs.incomeByMenu.updateOptions(this.$store.state.analytics.incomeByMenu.chartOptions);
        });
    },
  },
  created() {
    //check authtoken
    if (!analyticsData.isRegistered) {
      this.$store.registerModule("analytics", analyticsData);
      analyticsData.isRegistered = true;
    }
    //set selectedMonth to current month
    this.selectedMonth = this.months[new Date().getMonth()];
    this.loadStatistics();
  },
  mounted() {
    this.isMounted = true;
  },
  watch: {
    selectedMonth: function (val) {
      var now = new Date();
      var startDate = new Date(now.getFullYear(), this.months.indexOf(val), 1);
      var endDate = new Date(
        now.getFullYear(),
        this.months.indexOf(val) + 1,
        0
      );

      startDate = parseInt(
        (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      );
      endDate = parseInt(
        (now.getTime() - endDate.getTime()) / (1000 * 3600 * 24)
      );

      if (endDate < 0) endDate = 0;

      this.$store
        .dispatch("analytics/statsRevenue", {
          authKey: this.getAuthToken(),
          restaurantId: this.getCurrentRestaurantId(),
          month: this.months.indexOf(val),
        })
        .then(() => {
          this.$refs.revenueChart.updateSeries([
            {
              name: "This Month",
              data: this.$store.state.analytics.revenueData.series[0].data,
            },
            {
              name: "Last Month",
              data: this.$store.state.analytics.revenueData.series[1].data,
            },
          ]);
        });
      this.$store.dispatch("analytics/statsTopMenuItems", {
        authKey: this.getAuthToken(),
        restaurantId: this.getCurrentRestaurantId(),
        startPeriod: startDate,
        endPeriod: endDate,
      });
    },
  },
};
</script>
<style lang="scss">
.subText {
  font-size: 14px;
}
</style>

