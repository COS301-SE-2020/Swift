<template>
  <v-container class="orders" py-0 px-0>
    <div v-show="isLoadingCartItem" style="display: flex; align-items: center; justify-content: center;">
      <v-progress-circular style="height: 400px" indeterminate color="primary"></v-progress-circular>
    </div>
    <v-container v-show="!isLoadingCartItem" py-0 px-0>
      <v-card flat>
        <v-tabs v-model="tab" background-color="white" grow class="orderTabs">
          <v-tab>
            Order History
          </v-tab>
          <v-tab>
            Order Status
          </v-tab>
        </v-tabs>
      </v-card>
    </v-container>

    <v-container v-show="!isLoadingCartItem" py-0 px-0>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <div class="orderSearchBar mx-0 px-0 d-flex align-center  justify-center">
            <v-row class="mx-0 px-0 d-flex justify-center">
              <v-col class="px-0" cols="11">
                <v-text-field class="searchBarBg orderSearch mx-0" v-model="search" rounded clearable solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search for restaurant or order..."></v-text-field>
              </v-col>
            </v-row>
          </div>
          <div v-if="isLoading" style="display: flex; align-items: center; justify-content: center; margin-top: 10px">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          <v-container v-if="!isLoading" class="px-4">
            <div v-for="status in statusList" :key="status" class="pt-2 pb-2">
              <div v-if="itemsForStatus(status).length != 0">
                <v-subheader style="height: 20px" class="mt-3 mb-1 pl-1" v-text="status"></v-subheader>
                <v-list v-for="(item, index) in itemsForStatus(status).slice().reverse()" :key="index" class="py-2">
                  <v-card class="pt-1 pr-0 orderCard" elevation="2">
                    <v-row class="mx-0 d-flex justify-space-around" @click="viewOrder(item)">
                      <v-col cols="7" class="pb-0 pt-2">
                        <v-list-item-title class="restaurantName pb-1" v-text="item.restaurantName"></v-list-item-title>
                        <!-- <v-rating background-color="secondary" readonly size="13" dense color="yellow darken-3" :value="4"></v-rating> -->
                      </v-col>
                      <v-col cols="5" class="pb-0 pt-2 d-flex justify-end">
                        <v-list-item-action-text class="orderDateTime" v-text="getDate(item.orderDateTime)"></v-list-item-action-text>
                      </v-col>
                    </v-row>
                    <v-row class="mx-0" v-for="(orderItem, index) in item.items" :key="index" @click="viewOrder(item)">
                      <v-col class="pb-0 pt-2" cols="8">
                        <v-icon size="15px">{{(parseInt(orderItem.progress) == 100) ? 'mdi-check-box-outline' : 'mdi-checkbox-blank-outline'}}</v-icon> 
                        <span class="pl-1 orderDetails">{{orderItem.menuItemName}}</span>
                      </v-col>
                      <v-col class="pb-0 pt-2 pl-0" cols="4">
                        <span class="orderDetails">{{orderItem.quantity}}x </span>
                        <!-- <v-rating background-color="secondary" readonly size="11" class="pl-2" dense color="yellow darken-3" :value="5" style="display: inline"></v-rating> -->
                      </v-col>
                    </v-row>
                    <v-row class="mx-0 pb-1 pr-1">
                      <v-col cols="5" class="pb-2 orderButtons ">
                        <v-btn v-if="item.orderStatus != 'Received'" @click="addOrder(item)" text class="pa-0 button">
                          <v-icon color="primary" size="20px">mdi-history</v-icon> 
                          <span class="pl-1 orderOptions repeat">Repeat Order</span>
                        </v-btn>
                        <v-btn v-else text class="pa-0 button" @click="goToOrderStatus">
                          <v-icon color="primary" size="20px">mdi-history</v-icon> 
                          <span class="pl-1 orderOptions repeat">Order Status</span>
                        </v-btn>
                      </v-col>
                      <v-col cols="3" class="pb-2 px-1 orderButtons">
                        <v-btn v-if="item.orderStatus == 'Paid'" text class="pa-0 button">
                          <v-icon size="17px">mdi-comment-edit</v-icon> 
                          <span class="pl-1 orderOptions">Rate</span>
                        </v-btn>
                        <v-btn v-if="item.orderStatus == 'Received'" @click="payForOrder(item)" text class="pa-0 pl-1 button">
                          <v-icon color="accent" size="17px">mdi-currency-usd</v-icon> 
                          <span class="pl-1 orderOptions payNow">Pay Now</span>
                        </v-btn>
                      </v-col>
                      <v-col cols="4" class="pb-2 d-flex justify-end">
                        <div>
                          <div class="totalTitle">TOTAL</div>
                          <div class="orderPrice">R{{calculateFullTotal(item)}}</div>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-list>
              </div>
            </div>
          </v-container>
        </v-tab-item>

        <v-tab-item v-if="getOrderStatusItem() != null">
          <v-container fill-height fluid class="pa-0 d-flex align-start orderStatusTrack overflow-y-hidden overflow-x-hidden">
            <v-row class="mt-3">
              <v-col cols="12" class="d-flex justify-center">
                  <div class="body-1 secondary--text">Order No: {{getOrderStatusItem().orderNumber}}</div>
              </v-col>
            </v-row>

            <v-row class="mt-12 mb-0 py-0 mx-1">
              <v-col cols="5" class="pb-0 pl-4 py-0">
                  <div class="mt-2 body-1 secondary--text">Order Placed</div>
                  <div class="secondary--text" style="font-size:10px"><v-icon size="13px" class="font-weight-light">mdi-clock-time-four-outline</v-icon> {{displayOrderTime()}} </div>
              </v-col>
              <v-col cols="2" class="pb-0 pl-0 py-0" style="margin-left: 2px;">
                  <v-icon id="orderPlacedIcon" size="50" class="pb-0 font-weight-light" color="primary">mdi-clock-time-four</v-icon>
              </v-col>
            </v-row>

            <v-row class="my-0 py-0 mx-0">
              <v-col cols="6" class="py-0 px-0 mx-0" style="display: table;">
                <div style="height: 0; padding: 43% 0;">
                  <v-progress-linear stream buffer-value="0" :value="getOrderStatusItem().progress" style="display: block; transform-origin: top right; transform: rotate(90deg); margin-top: 50%; white-space: nowrap; progressBar"></v-progress-linear>
                </div>
              </v-col>
              <v-col cols="6" class="pb-0 pl-5">
                  <div class="mt-2 body-1 secondary--text d-flex justify-center">Complete</div>
                  <div class="secondary--text d-flex justify-center" style="font-size:35px">{{getOrderStatusItem().progress}}%</div>
              </v-col>
            </v-row>

            <v-row class="mt-0 mb-0 py-0 mx-1">
              <v-col cols="5" class="pb-0 pl-4">
                  <div class="mt-2 body-1 secondary--text" v-show="parseInt(getOrderStatusItem().progress) > 0">Order Busy</div>
              </v-col>
              <v-col cols="1" class="pb-0 pl-0" style="margin-left: 4px;">
                  <v-avatar color="primary" id="orderDoneIcon" size="45" class="ma-0 pa-0" >
                    <v-icon size="32" class="font-weight-light ma-0 pa-0" color="white">mdi-pot-steam</v-icon>
                  </v-avatar>
              </v-col>
              <v-col cols="5" class="pb-0 pl-7 pr-0">
                  <div class="secondary--text" style="font-size:12px" v-show="parseInt(getOrderStatusItem().progress) > 0">Our chef is busy preparing your order</div>
              </v-col>
            </v-row>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-container>
    <NavBar></NavBar>
  </v-container>
</template>

<script>
import NavBar from '@/components/layout/NavBar';
import { mapActions, mapGetters } from 'vuex'
import moment from 'moment'

export default {
  data () {
    return {
      statusList: ['Ongoing', 'Completed'],
      tab: null,
      progressValue: 33,
      itemsCompleted: 3,
      totalItems: 9,
      search: '',
      filter: {},
      ptr: this,
      isLoading: false,
      isLoadingCartItem: false,
    }
  },
  async mounted() {
    var length = await this.orderHistory.length;
    if (length == undefined) {
      this.isLoading = !this.isLoading;
      var response = await this.orderHistory;
      if (response)
        this.isLoading = !this.isLoading;
    }
  },
  methods: {
    goToMenu () {
      this.$router.push('/menu')
    },
    goToRating () {
      this.$router.push('/rating')
    },
    viewOrder (item) {
      this.clearOrder()
      this.addOrder(item)
    },
    calculateFullTotal(item) {
      let total = parseFloat(this.calculateTotal(item));
      total += (parseFloat(total) * 0.14);
      total += (parseFloat((item.waiterTip != null) ? item.waiterTip : 0));
      return parseFloat(total).toFixed(2);
    },
    calculateTotal(item) {
      let total = 0;
      if (item.items != undefined) {
        for (let i = 0; i < item.items.length; i++) {
          total += parseFloat((item.items[i].itemTotal != null) ? item.items[i].itemTotal : 0);
        }
      }
      return parseFloat(total).toFixed(2);
    },
    itemsForStatus(status) {
      return this.orderHistory.filter(orderItem => {
        if (status == 'Completed') {
          return orderItem.restaurantName.toLowerCase().includes(this.search != null ? this.search.toLowerCase() : '') && (parseInt(orderItem.progress) == 100 && orderItem.orderStatus != "Received")
        } else { 
          return orderItem.restaurantName.toLowerCase().includes(this.search != null ? this.search.toLowerCase() : '') && (parseInt(orderItem.progress) < 100 || orderItem.orderStatus == "Received")
        }
      })
    },
    getOrderStatusItem() {
      return (this.orderHistory.find(orderItem => {
        return parseInt(orderItem.progress) < 100 || orderItem.orderStatus == "Received"
      }))
    },
    createOrderObject(item) {
      let itemsOrdered = [];
      for (let i = 0; i < item.items.length; i++) {
        let data = {
          "menuItemId": item.items[i].menuItemId,
          "itemTotal": item.items[i].itemTotal,
          "quantity": item.items[i].quantity,
          "orderSelections": item.items[i].orderSelections
        };
        itemsOrdered[i] = data;
      }

      
      let data = {
        "orderInfo": {
          "restaurantId": item.restaurantId,
          "tableId": 1,
          "employeeId": 2,
          "orderTotal": item.total,
          "waiterTip": item.waiterTip,
          "orderItems": itemsOrdered
        }
      }

      return data;
    },
    async addOrder(item) {
      let data = this.createOrderObject(item);
      this.addItemToOrder(data)
      this.isLoadingCartItem = true;
      var menuRetrieved = await this.$store.dispatch('MenuStore/retrieveMenu', item.restaurantId);

      if (menuRetrieved) {
        this.isLoadingCartItem = false;
      }

      this.$router.push("/cart");
    },
    payForOrder(item) {

      console.log(this.paymentInfo)
      // if ()
      let data = {
        "orderId": item.orderId,
        "paymentMethod": "Card",
        "amountPaid": parseFloat((item.orderTax != null) ? item.orderTax : 0) + parseFloat((item.orderTotal != null) ? item.orderTotal : 0) + parseFloat((item.waiterTip != null) ? item.waiterTip : 0),
        "waiterTip": parseFloat((item.waiterTip != null) ? item.waiterTip : 0),
        "orderTotal": parseFloat(this.calculateTotal(item)),
        "orderTax": parseFloat(this.calculateTotal(item) * 0.14)
      }

      this.addPaymentInfo(data);
      this.$router.push("/paymentinformation");

    },
    goToOrderStatus() {
      this.tab = 1;
    },
    getDate(date) {
      return 'On ' + moment(String(date.slice(0, 10))).format('DD MMMM YYYY')
    },
    displayOrderTime() {
      return this.getOrderStatusItem().orderDateTime.slice(11, 16) + ', ' + moment(String(this.getOrderStatusItem().orderDateTime.slice(0, 10))).format('DD MMMM YYYY')
    },
    updateOrderStatus() {
      let self = this;
      setInterval(() => { 
        let order = self.getOrderStatusItem();
        if (order != undefined) {
          let data = {
            "orderId": order.orderId
          }
          self.orderStatus(data)
        }
      }, 3000);  
    },
    ...mapActions({
      addItemToOrder: "OrderStore/addItemToOrder",
      addPaymentInfo: "OrderStore/addPaymentInfo",
      clearOrder: "OrderStore/clearOrder",
      orderStatus: 'OrderStore/retrieveOrderStatus',
    }),
  },
  computed: {
    filteredList() {
      return this.orderHistory.filter(orderItem => {
        return orderItem.restaurantName.toLowerCase().includes(this.search.toLowerCase())
      })
    },
    ...mapGetters({
      orderHistory: 'CustomerStore/getCustomerOrderHistory',
      checkedInRestaurantId: 'CustomerStore/getCheckedInRestaurantId',
    }),
    
  },
  components: {
    'NavBar': NavBar
  },
  beforeMount: function() {
    this.updateOrderStatus()
  },
  
}
</script>
<style>
.orderTabs {
  font-family: 'Helvetica' !important;
}

.orderSearchBar .searchBarBg .v-input__slot {
  background: rgba(255, 255, 255, 1) !important;
}

.orderSearchBar .searchBarBg.v-text-field.v-text-field--solo .v-input__control {
  max-width: 100% !important;
}

.restaurantName {
  font-family: 'Helvetica';
  font-size: 16px !important;
  font-weight: 300;
}

.totalTitle {
  font-size: 10px;
  font-weight: 300;
}

.orderDateTime {
  font-size: 11px;
}

.orderDetails {
  font-size: 12px;
  font-weight: 300;
  line-height: 1 !important;
}

.orderOptions {
  font-size: 13px;
  font-weight: 300 !important;
}

.orderPrice {
  font-size: 15px;
}

.orderButtons {
  align-self: flex-end;
}

.orderCard {
  border-radius: 13px !important;
  line-height: 1.15 !important;
}

.orderSearchBar {
  background-color: rgba(0, 0, 0, 0.04);
  height: 90px;
}

.repeat {
  color: #f75564;
}

.payNow {
  color: #76C5BA;
}

.button {
  font-family: "Roboto", sans-serif !important;
  height: 17px !important;
  font-weight: 300 !important;
  letter-spacing: 0ch !important;
}
</style>
