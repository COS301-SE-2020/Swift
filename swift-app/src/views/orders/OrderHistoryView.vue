<template>
  <div class="orders" style="height:100%;">
    <v-container py-0>
      <div class="row d-flex flex-column align-stretch align-self-center">
        <v-card flat>
          <v-tabs v-model="tab" background-color="white" grow>
            <v-tab>
              Order History
            </v-tab>
            <v-tab>
              Order Status
            </v-tab>
          </v-tabs>
        </v-card>
      </div>
    </v-container>
    <v-tabs-items v-model="tab" style="width:96%; height:96%;">
      
      <v-tab-item style="height:100%;">
        <v-container>

          <div>
            <v-text-field class="searchBarBg" v-model="search" rounded clearable flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"></v-text-field>
          </div>
          <template>
            <div v-for="status in statusList" :key="status">
              <div v-if="itemsForStatus(status).length != 0">
                <v-subheader style="height: 20px" class="mt-3 mb-1 pl-1" v-text="status"></v-subheader>
                <v-list v-for="(item, index) in itemsForStatus(status)" :key="index" class="py-2">
                  <v-card>
                    <v-list-item ripple class="pt-1 pr-0">
                      <v-list-item-content>
                        <v-list-item-title class="mb-2" v-text="item.restaurantName"></v-list-item-title>
                        <div v-for="(orderItem, index) in item.items" :key="index">
                          <v-list-item-subtitle>- {{orderItem.menuItemName}}</v-list-item-subtitle>
                        </div>
                      </v-list-item-content>
                      <v-list-item-action class="mr-3">
                        <v-list-item-action-text v-text="item.orderDateTime"></v-list-item-action-text>
                        <v-list-item-action-text class="subtitle-1">R{{item.total}}0</v-list-item-action-text>
                      </v-list-item-action>
                    </v-list-item>
                    <v-row class="pt-0">
                      <v-col v-if="parseInt(item.orderStatus) < 100" cols="12" align="end" class="pt-0 pr-5">
                        <v-btn rounded small color="primary" class="mr-2">Track Order</v-btn>
                        <v-btn @click="goToCart" rounded small>Cart</v-btn>
                      </v-col>
                      <v-col v-else-if="item.orderStatus == '100'"  cols="12" align="end" class="pt-0 pr-5">
                        <v-btn rounded small color="primary" class="mr-2">Pay</v-btn>
                        <v-btn rounded small>View</v-btn>
                      </v-col>
                      <v-col v-else cols="12" align="end" class="pt-0 pr-5">
                        <v-btn rounded small color="primary" class="mr-2">Rate Order</v-btn>
                        <v-btn rounded small>View</v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-list>
              </div>
            </div>
          </template>

        </v-container>
      </v-tab-item>

      <v-tab-item style="width:100%;">
        <v-container fluid fill-height class="pa-0 d-flex align-start">
          <v-row class="overflow-y-auto mt-3">
            <v-col cols="12" class="d-flex justify-center">
                <div class="body-1 secondary--text">Order No: 53234</div>
            </v-col>
          </v-row>

          <v-row class="mt-12 mb-0 py-0 mx-1">
            <v-col cols="5" class="pb-0 pl-4 py-0">
                <div class="mt-2 body-1 secondary--text">Order Placed</div>
                <div class="secondary--text" style="font-size:10px"><v-icon size="13px" class="font-weight-light">mdi-clock-time-four-outline</v-icon> 10:30, 20 June 2020</div>
            </v-col>
            <v-col cols="2" class="pb-0 pl-0 py-0" style="margin-left: 2px;">
                <v-icon id="orderPlacedIcon" size="50" class="pb-0 font-weight-light" color="primary">mdi-clock-time-four</v-icon>
            </v-col>
          </v-row>

          <v-row class="my-0 py-0 mx-0">
            <v-col cols="6" class="py-0 px-0 mx-0" style="display: table;">
              <div style="height: 0; padding: 43% 0;">
                <v-progress-linear stream buffer-value="0" :value="getOrderStatusItem().orderStatus == 'in-progress' ? 0 : getOrderStatusItem().orderStatus" style="display: block; transform-origin: top right; transform: rotate(90deg); margin-top: 50%; white-space: nowrap; progressBar"></v-progress-linear>
              </div>
            </v-col>
            <v-col cols="6" class="pb-0 pl-5">
                <div class="mt-2 body-1 secondary--text d-flex justify-center">Complete</div>
                <div class="secondary--text d-flex justify-center" style="font-size:35px">{{getOrderStatusItem().orderStatus == 'in-progress' ? 0 : getOrderStatusItem().orderStatus}}%</div>
                <!-- <div class="body-2 secondary--text d-flex justify-center">{{0}}/{{getOrderStatusItem().items.length}} Items completed</div> -->
            </v-col>
          </v-row>

          <v-row class="mt-0 mb-0 py-0 mx-1">
            <v-col cols="5" class="pb-0 pl-4">
                <div class="mt-2 body-1 secondary--text">Order Busy</div>
            </v-col>
            <v-col cols="1" class="pb-0 pl-0" style="margin-left: 4px;">
                <v-avatar color="primary" id="orderDoneIcon" size="45" class="ma-0 pa-0" >
                  <v-icon size="32" class="font-weight-light ma-0 pa-0" color="white">mdi-pot-steam</v-icon>
                </v-avatar>
            </v-col>
            <v-col cols="5" class="pb-0 pl-7 pr-0">
                <div class="secondary--text" style="font-size:12px">Our chef is busy preparing your order</div>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>

    </v-tabs-items>
    <NavBar></NavBar>
  </div>
</template>

<script>
import NavBar from '@/components/layout/NavBar';
import { mapActions, mapGetters } from 'vuex'

export default {
  data () {
    return {
      statusList: ['In Progress', 'Completed'],
      tab: null,
      progressValue: 33,
      itemsCompleted: 3,
      totalItems: 9,
      search: '',
      filter: {},
      ptr: this,
    }
  },
  methods: {
    goToMenu () {
      this.$router.push('/menu')
    },
    goToCart () {
      this.$router.push('/cart')
    },
    itemsForStatus(status) {
      return this.orderHistory.filter(orderItem => {
        if (status == 'Completed')
          return orderItem.restaurantName.toLowerCase().includes(this.search != null ? this.search.toLowerCase() : '') && (orderItem.orderStatus == "Paid" || orderItem.orderStatus == "100")
        else 
          return orderItem.restaurantName.toLowerCase().includes(this.search != null ? this.search.toLowerCase() : '') && (parseInt(orderItem.orderStatus) < 100 || orderItem.orderStatus == "in-progress")
      }) 
    },
    getOrderStatusItem() {
      return this.orderHistory.find(orderItem => {
        return parseInt(orderItem.orderStatus) < 100 || orderItem.orderStatus == "in-progress"
      })
    },
    updateOrderStatus() {
      var self = this;
      setInterval(() => { 
        var data = {
          "orderId": self.getOrderStatusItem().orderId
        }
        self.orderStatus(data)
      }, 3000);  
    },
    ...mapActions({
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
      orderHistory: 'OrderStore/getOrderHistory',
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
.searchBarBg .v-input__slot {
  background: rgba(0, 0, 0, 0.06) !important;
  caret-color: #343434 !important;
  color: #343434 !important;
}
</style>
