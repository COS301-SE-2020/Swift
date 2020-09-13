<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Statistics</h2>
      </div>
    </div>
    <h4 class="mb-2">Financial Statistics</h4>
    <div class="vx-row">
      <div class="vx-col w-full md:w-2/3 mb-base">
        <vx-card title="Revenue">
          <div slot="no-body" class="p-6 pb-0">
            <div class="flex" v-if="revenueData.analyticsData">
              <div class="mr-6">
                <p class="mb-1 font-semibold">This Month</p>
                <p class="text-3xl text-success">
                  <sup class="text-base mr-1">$</sup>
                  {{ revenueData.analyticsData.thisMonth.toLocaleString() }}
                </p>
              </div>
              <div>
                <p class="mb-1 font-semibold">Last Month</p>
                <p class="text-3xl">
                  <sup class="text-base mr-1">$</sup>
                  {{ revenueData.analyticsData.lastMonth.toLocaleString() }}
                </p>
              </div>
            </div>
            <vue-apex-charts
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
            <vs-progress :percent="menuItem.ratio"></vs-progress>
          </div>
        </vx-card>
      </div>
    </div>
    <div class="vx-row">
      <div class="vx-col md:w-1/2 w-full mb-base">
        <vx-card title="Average Order Price">
          <vue-apex-charts
            type="line"
            height="350"
            :options="avgOrderPrice.chartOptions"
            :series="avgOrderPrice.series"
          ></vue-apex-charts>
        </vx-card>
      </div>

      <!-- COLUMN CHART -->
      <div class="vx-col md:w-1/2 w-full mb-base">
        <vx-card title="Income By Menu" code-toggler>
          <vue-apex-charts
            type="bar"
            height="350"
            :options="incomeByMenu.chartOptions"
            :series="incomeByMenu.series"
          ></vue-apex-charts>
          <template slot="codeContainer">{{ incomeByMenuCode }}</template>
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
  computed: {
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
<style lang="scss">
.subText {
  font-size: 14px;
}
</style>

