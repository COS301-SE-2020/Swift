<template>
  <v-container class="orders" py-0 px-0>
    <v-container py-0 px-0>
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

    <v-container py-0 px-0>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <div class="orderSearchBar mx-0 px-0 d-flex align-center  justify-center">
            <v-row class="mx-0 px-0 d-flex justify-center">
              <v-col class="px-0" cols="11">
                <v-text-field class="searchBarBg orderSearch mx-0" v-model="search" rounded clearable solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search for restaurant or order..."></v-text-field>
              </v-col>
            </v-row>
          </div>
          <v-container>
            <div v-for="status in statusList" :key="status">
              <div v-if="itemsForStatus(status).length != 0">
                <v-subheader style="height: 20px" class="mt-3 mb-1 pl-1" v-text="status"></v-subheader>
                <v-list v-for="(item, index) in itemsForStatus(status)" :key="index" class="py-2">
                  <v-card ripple class="pt-1 pr-0 orderCard" elevation="2">
                    <v-row class="mx-0 d-flex justify-space-around">
                      <v-col cols="8" class="pb-0 pt-2">
                        <v-list-item-title class="restaurantName" v-text="item.restaurantName"></v-list-item-title>
                        <v-rating background-color="secondary" readonly size="13" dense color="yellow darken-3" :value="4"></v-rating>
                      </v-col>
                      <v-col cols="4" class="pb-0 pt-2">
                        <v-list-item-action-text class="orderDateTime" v-text="getDate(item.orderDateTime)"></v-list-item-action-text>
                      </v-col>
                    </v-row>
                    <v-row class="mx-0" v-for="(orderItem, index) in item.items" :key="index">
                      <v-col class="pb-0 pt-2" cols="5">
                        <v-icon size="15px">mdi-check-box-outline</v-icon> 
                        <span class="pl-1 orderDetails">{{orderItem.menuItemName}}</span>
                      </v-col>
                      <v-col class="pb-0 pt-2" cols="7">
                        <span class="orderDetails">{{orderItem.quantity}}x </span>
                        <v-rating background-color="secondary" readonly size="12" class="pl-2" dense color="yellow darken-3" :value="5" style="display: inline"></v-rating>
                      </v-col>
                    </v-row>
                    <v-row class="mx-0 pb-1">
                      <v-col cols="5" class="pb-2 orderButtons">
                        <v-icon color="primary" size="20px">mdi-history</v-icon> 
                        <span class="pl-1 orderOptions">Repeat Order</span>
                      </v-col>
                      <v-col cols="4" class="pb-2 orderButtons">
                        <v-icon size="17px">mdi-comment-edit</v-icon> 
                        <span class="pl-1 orderOptions">Rated</span>
                      </v-col>
                      <v-col cols="3" class="pb-2">
                        <div class="totalTitle">TOTAL</div>
                        <div class="orderPrice">R{{(item.total).toFixed(2)}}</div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-list>
              </div>
            </div>
          </v-container>
        </v-tab-item>

        <v-tab-item style="width:100%;" v-if="getOrderStatusItem() != null">
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
    goToRating () {
      this.$router.push('/rating')
    },

    itemsForStatus(status) {
      return this.orderHistory.filter(orderItem => {
        if (status == 'Completed') {
          return orderItem.restaurantName.toLowerCase().includes(this.search != null ? this.search.toLowerCase() : '') && (orderItem.orderStatus == "Paid" || orderItem.orderStatus == "100")
        } else { 
          return orderItem.restaurantName.toLowerCase().includes(this.search != null ? this.search.toLowerCase() : '') && (parseInt(orderItem.orderStatus) < 100 || orderItem.orderStatus == "in-progress")
        }
      })
    },
    getOrderStatusItem() {
      return (this.orderHistory.find(orderItem => {
        return parseInt(orderItem.orderStatus) < 100 || orderItem.orderStatus == "in-progress"
      }))
    },
    getDate(date) {
      return 'On ' + moment(String(date.slice(0, 10))).format('DD MMMM YYYY')
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
  font-size: 18px !important;
  /* font-weight: 400; */
}

.totalTitle {
  font-size: 10px;
  font-weight: 300;
}

.orderDateTime {
  font-size: 12px;
}

.orderDetails {
  font-size: 15px;
  font-weight: 300;
}

.orderOptions {
  font-size: 15px;
  font-weight: 300;
}

.orderPrice {
  font-size: 18px;
}

.orderButtons {
  align-self: flex-end;
}

.orderCard {
  border-radius: 13px !important;
}

.orderSearchBar {
  background-color: rgba(0, 0, 0, 0.04);
  height: 90px;
}
</style>
