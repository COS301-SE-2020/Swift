<template>
  <div class="vx-row">
    <div
      v-for="order in tests"
      :key="order.tableNumber"
      class="vx-col w-full md:w-1/3 lg:w-1/3 xl:w-1/3 mb-base"
    >
      <vx-card
        :title="'Order: Table ' + order.tableNumber"
        :subtitle="'Placed: ' + order.timePlaced"
        @refresh="closeCardAnimationDemo"
        collapse-action
      >
        <vs-chip class="employeeName" color="success">Employee: {{order.employeeAssigned}}</vs-chip>
        <vs-divider border-style="solid" color="white"></vs-divider>
        <p>Order Progress:</p>
        <vs-progress :height="8" :percent="order.orderProgress" color="warning"></vs-progress>
        <vs-list>
          <vs-list-header :title="'Order Total: R'+order.orderTotal"></vs-list-header>
          <div v-for="menuItem in order.items" :key="menuItem.menuItemName" class="singleMenuItem">
            <vs-chip color="primary">R{{menuItem.menuItemPrice}}</vs-chip>
            <vs-chip color="success">Qty: {{menuItem.menuItemQty}}</vs-chip>
            <vs-list-item
              :title="menuItem.menuItemName"
              :subtitle="menuItem.menuItemDescription"
            >
              <vs-button size="small" color="warning">{{menuItem.menuItemStatus}}</vs-button>
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
      tests: [
        {
          orderId: 5,
          tableNumber: "23",
          timePlaced: "2020-07-18T18:49:32.706Z",
          employeeAssigned: "James Richards",
          orderProgress: 0,
          orderTotal: "394.40",
          items: [
            {
              menuItemName: "Low-Carb Breakfast",
              menuItemDescription:
                "Two poached eggs, grilled halloumi, avo*, sautéed baby spinach & pan - roasted rosemary cherry tomatoes.",
              menuItemPrice: 69.9,
              menuItemQty: 2,
              menuItemStatus: "Order Placed"
            },
            {
              menuItemName: "Toasted Chicken Mayo & Easy Cappuccino",
              menuItemDescription: null,
              menuItemPrice: 69.9,
              menuItemQty: 1,
              menuItemStatus: "Order Placed"
            },
            {
              menuItemName: "Buttermilk Fried Chicken",
              menuItemDescription:
                "Sesame-crusted buttermilk fried chicken strips with sweet chilli dipping sauce.",
              menuItemPrice: 49.9,
              menuItemQty: 2,
              menuItemStatus: "Order Placed"
            },
            {
              menuItemName: "BBQ",
              menuItemDescription:
                "Chargrilled beef patty with our own BBQ basting sauce, layered with gherkins, tomato, burger mayo, red onion & lettuce.",
              menuItemPrice: 84.9,
              menuItemQty: 1,
              menuItemStatus: "Order Placed"
            }
          ]
        },
              ]
    };
  },
  computed: {
    orders() {
     // return this.$store.state.orderDataList.orders;
    }
  },
  methods: {
    closeCardAnimationDemo(card) {
      card.removeRefreshAnimation(3000);
    },
    listOrders() {
      this.$store.dispatch("orderDataList/listOrders");
    }
  },
  created() {
    if (!moduleDataList.isRegistered) {
      this.$store.registerModule("orderDataList", moduleDataList);
      moduleDataList.isRegistered = true;
	}
	this.listOrders();
//	alert(this.$store.state.orderDataList.orders);
  },
   watch: {
    orders: {
      immediate: true,
      deep: false,
      handler(newValue, oldValue) {
        console.log(newValue);
      }
    }
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