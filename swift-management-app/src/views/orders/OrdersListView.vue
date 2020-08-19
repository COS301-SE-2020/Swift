<template>
  <div class="vx-row">
    <div
      v-for="order in orders"
      :key="order.orderId"
      class="vx-col w-full md:w-1/3 lg:w-1/3 xl:w-1/3 mb-base"
    >
      <vx-card
        :title="'Order: Table ' + order.tableNumber"
        :subtitle="'Placed: ' + order.timePlaced"
        @refresh="closeCardAnimationDemo"
        collapse-action
        :data-item-count="order.items.length"
        :data-progress="order.orderProgress"
        :id="'OrderCard'+order.orderId"
      >
        <vs-chip class="employeeName" color="success">Waiter: {{order.employeeAssigned}}</vs-chip>
        <vs-divider border-style="solid" color="white"></vs-divider>
        <p>Order Progress:</p>
        <vs-progress
          :height="8"
          :percent="parseInt(order.orderProgress)"
          :color="getStatusColor(order.orderProgress)"
        ></vs-progress>
        <vs-list>
          <vs-list-header :title="'Order Total: R'+order.orderTotal"></vs-list-header>
          <div v-for="menuItem in order.items" :key="menuItem.menuItemName" class="singleMenuItem">
            <vs-chip color="primary">R{{menuItem.menuItemPrice}}</vs-chip>
            <vs-chip color="success">Qty: {{menuItem.menuItemQty}}</vs-chip>
            <vs-list-item :title="menuItem.menuItemName" :subtitle="menuItem.menuItemDescription">
              <vs-button
                :id="'ItemProgressOrderID'+order.orderId+'ItemID'+menuItem.menuItemId"
                :data-progress="menuItem.menuItemProgress"
                size="small"
                :color="getStatusColor(menuItem.menuItemProgress)"
                @click.stop="updateMenuItemProgress(order.orderId,menuItem.menuItemId)"
              >{{getMenuItemStatus(menuItem.menuItemProgress)}}</vs-button>
            </vs-list-item>
          </div>
        </vs-list>
      </vx-card>
    </div>
  </div>
</template>
       

<script>
import moduleDataList from "@/store/orders/orderDataList.js";
import $ from "jquery";

export default {
  data() {
    return {
      isMounted: false,
    };
  },
  computed: {
    orders() {
      if (this.$store.state.orderList)
        return this.$store.state.orderList.orders;
      else return null;
    },
    orderCount() {
      if (this.$store.state.orderList)
        return this.$store.state.orderList.orders.length;
      else return null;
    },
  },
  methods: {
    increaseItemPercentage(orderId, percentage) {
      this.$store.dispatch("orderList/increaseItemPercentage", {
        orderId: orderId,
        percentage: percentage,
        authKey: this.getAuthToken(),
      });
    },
    listOrders() {
      this.$store.dispatch("orderList/listOrders", {
        authKey: this.getAuthToken(),
      });
    },
    closeCardAnimationDemo(card) {
      card.removeRefreshAnimation(3000);
    },
    getStatusColor(percentage) {
      if (percentage < 10) return "danger";
      if (percentage < 80) return "warning";
      return "success";
    },
    getMenuItemStatus(percentage) {
      if (percentage < 10) return "Item In Progress";
      if (percentage < 80) return "Item Nearly Complete";
      return "Item Complete";
    },
    updateMenuItemProgress(orderId, itemId) {
      var currentProgress = parseInt(
        $("#ItemProgressOrderID" + orderId + "ItemID" + itemId).attr(
          "data-progress"
        )
      );

      let progress = currentProgress + 100 / 3;
      if (progress > 99) progress = 100;

      $("#ItemProgressOrderID" + orderId + "ItemID" + itemId).attr(
        "data-progress",
        progress
      );
      $("#ItemProgressOrderID" + orderId + "ItemID" + itemId).attr(
        "style",
        "background:  rgba(var(--vs-" +
          this.getStatusColor(progress) +
          "),1)!important;"
      );
      //TODO:Change hover color as well
      $(
        "#ItemProgressOrderID" +
          orderId +
          "ItemID" +
          itemId +
          " .vs-button--text"
      ).text(this.getMenuItemStatus(progress));

      if (currentProgress < 100) {
        let totalOrderProgress = parseInt(
          $("#OrderCard" + orderId).attr("data-progress")
        );
        let OrderMenuItemCount = parseInt(
          $("#OrderCard" + orderId).attr("data-item-count")
        );

        totalOrderProgress += (100 / 3) * (1 / OrderMenuItemCount);
        if (totalOrderProgress > 95) totalOrderProgress = 100;

        $("#OrderCard" + orderId).attr("data-progress", totalOrderProgress);
        $("#OrderCard" + orderId + " .vs-progress--foreground").attr(
          "style",
          "background: rgba(var(--vs-" +
            this.getStatusColor(totalOrderProgress) +
            "),1)!important;width: " +
            totalOrderProgress +
            "%"
        );

        this.increaseItemPercentage(orderId, totalOrderProgress);
      }
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      if (!moduleDataList.isRegistered) {
        this.$store.registerModule("orderList", moduleDataList);
        moduleDataList.isRegistered = true;
      }
      if (!this.orderCount > 0) this.$vs.loading();

      this.listOrders();
    }
  },
  mounted() {
    this.isMounted = true;
  },
  watch: {
    orderCount(newCount, oldCount) {
      this.$vs.loading.close();
    },
  },
};
</script>

<style scoped>
.con-vs-chip {
  margin-top: 17px;
}
.employeeName {
  margin-top: 0px;
}
</style>