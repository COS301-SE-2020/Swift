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
      >
        <vs-chip class="employeeName" color="success">Waiter: {{order.employeeAssigned}}</vs-chip>
        <vs-divider border-style="solid" color="white"></vs-divider>
        <p>Order Progress:</p>
        <vs-progress :height="8" :percent="order.orderProgress" :color="getOrderStatusColor(order.orderProgress)"></vs-progress>
        <vs-list>
          <vs-list-header :title="'Order Total: R'+order.orderTotal"></vs-list-header>
          <div v-for="menuItem in order.items" :key="menuItem.menuItemName" class="singleMenuItem">
            <vs-chip color="primary">R{{menuItem.menuItemPrice}}</vs-chip>
            <vs-chip color="success">Qty: {{menuItem.menuItemQty}}</vs-chip>
            <vs-list-item
              :title="menuItem.menuItemName"
              :subtitle="menuItem.menuItemDescription"
            >
              <vs-button size="small" :color="getOrderStatusColor(menuItem.menuItemProgress)"  @click.stop="updateMenuItemProgress(order.orderId,menuItem.menuItemId)">{{getMenuItemStatus(menuItem.menuItemProgress)}}</vs-button>
            </vs-list-item>
        </div>
        </vs-list>
      </vx-card>
    </div>
  </div>
</template>
       

<script>
import moduleDataList from "@/store/orders/orderDataList.js";

export default {
  data() {
    return {
      isMounted: false,
    };
  },
  computed: {
    orders() {
      if(this.$store.state.orderList)
        return this.$store.state.orderList.orders;
      else return null
  },
	orderCount () {
		if(this.$store.state.orderList)
			  return this.$store.state.orderList.orders.length
		else
			return null
    }
  },
  methods: {
     increaseItemPercentage() {
      this.$store.dispatch("orderList/increaseItemPercentage");
    },
      listOrders() {
      this.$store.dispatch("orderList/listOrders");
    },
    closeCardAnimationDemo(card) {
      card.removeRefreshAnimation(3000);
    },
    getOrderStatusColor(percentage){
      if(percentage < 10)
        return "danger"
      if(percentage < 60)
        return "warning"
      return "success"
    },
    getMenuItemStatus(percentage){
      if(percentage < 10)
        return "Item In Progress"
      if(percentage < 60)
        return "Item Nearly Complete"
      return "Item Complete"
    },
    updateMenuItemProgress(orderId, itemId){
      this.increaseItemPercentage(orderId, itemId, 100);
    },
  },
  created() {
    if (!moduleDataList.isRegistered) {
      this.$store.registerModule("orderList", moduleDataList);
      moduleDataList.isRegistered = true;
  }
  if(!this.orderCount > 0)
    this.$vs.loading();

  this.listOrders();
  },
   mounted() {
    this.isMounted = true;
  },
  watch:{
    orderCount (newCount, oldCount) {
      this.$vs.loading.close();
   }
  }
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