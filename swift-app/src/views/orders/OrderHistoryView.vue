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
          <v-data-iterator :items="orderHistory[0].orderCategory.items" :search="search" hide-default-footer>
            <template v-once v-slot:header>
              <v-text-field label="Search..." class="searchBarBg" rounded v-model="search" clearable flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" ></v-text-field>
            </template>

            <template v-slot:default="props" >
              <v-subheader style="height: 20px" class="secondary--text subtitle-2 mt-3 mb-1 pl-1"  v-text="orderHistory[0].orderCategory.status"></v-subheader>
              <v-list v-for="item in props.items" :key="item.restaurant" class="py-2">
                <v-card>
                  <v-list-item ripple class="pt-1 pr-0">
                    <v-list-item-content>
                      <v-list-item-title class="mb-2" v-text="item.restaurant"></v-list-item-title>
                      <div v-for="(item, index) in item.orderItems" :key="index">
                        <v-list-item-subtitle>- {{item}}</v-list-item-subtitle>
                      </div>
                    </v-list-item-content>
                    <v-list-item-action class="mr-3">
                      <v-list-item-action-text v-text="item.date">11:00 June 24, 2020</v-list-item-action-text>
                      <v-list-item-action-text class="subtitle-1">R{{item.amount}}</v-list-item-action-text>
                    </v-list-item-action>
                  </v-list-item>
                  <v-row class="pt-0">
                    <v-col cols="12" align="end" class="pt-0 pr-5">
                      <v-btn rounded small color="primary" class="mr-2">Track Order</v-btn>
                      <v-btn rounded small>View</v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-list>
            </template>
          </v-data-iterator>

        </v-container>
      </v-tab-item>
      <!-- <v-tab-item style="width:100%; height:100%;">
        <v-container fluid fill-height class="pa-0">
          <div class="row d-flex flex-column align-self-center align-center">
            <v-avatar class="mb-8" height="140px" width="140px" fab color="primary">
              <v-icon size="65px" class="font-weight-light" color="white">mdi-cart-outline</v-icon>
            </v-avatar>
            <div class="headline mb-3 mt-12 secondary--text">Order Empty</div>
            <div class="subtitle-1 secondary--text">Order some food or drinks here:</div>
            <v-btn @click="goToMenu" class="mt-6" height="53px" width="100px" rounded large color="primary">Menu</v-btn>
          </div>
        </v-container>
      </v-tab-item> -->


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
                <v-progress-linear value="33" style="display: block; transform-origin: top right; transform: rotate(90deg); margin-top: 50%; white-space: nowrap; progressBar"></v-progress-linear>
              </div>
            </v-col>
            <v-col cols="6" class="pb-0 pl-5">
                <div class="mt-2 body-1 secondary--text d-flex justify-center">Complete</div>
                <div class="secondary--text d-flex justify-center" style="font-size:35px">{{progressValue}}%</div>
                <div class="body-2 secondary--text d-flex justify-center">{{itemsCompleted}}/{{totalItems}} Items completed</div>
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

export default {
  data () {
    return {
      tab: null,
      progressValue: 33,
      itemsCompleted: 3,
      totalItems: 9,
      search: '',
      filter: {},
      sortBy: 'restaurant',
      keys: [
        'Restaurant',
        'Title',
        'Description',
        'Avatar',
      ],
      orderHistory: [
        {
          orderCategory: {
            status: 'In Progress',
            items: [
              {
                restaurant: 'Mugg & Bean',
                date: '11:00 June 24, 2020',
                orderItems: ['1x Egg and avo on toast', '2x Filter Coffee'],
                amount: '90.00',
              },
              
            ],
          },
        },
        {
          orderCategory: {
            status: 'Completed',
            items: [
              {
                restaurant: "Crawdaddy's",
                date: '18:00 June 04, 2020',
                orderItems: ['1x Nachos Grande', '1x Sauce Burger', '1x Rib-eye Steak','2x Cappuccinos', '2x Chocolate dessert'],
                amount: '980.00',
              },
              {
                restaurant: 'Mugg & Bean',
                date: '08:00 June 02, 2020',
                orderItems: ['1x Chicken Mayo Sandwich', '1x Bottomless Coffee', '1x Orange Juice'],
                amount: '76.00',
              },
            ],
          },
        },
      ],
    }
  },
  methods: {
    goToMenu () {
      this.$router.push('/menu')
    },
  },
  computed: {
    filteredList() {
      return this.customerInfo.favourites.filter(favourite => {
        return favourite.menuItemName.toLowerCase().includes(this.search.toLowerCase())
      })
    }
  },
  components: {
    'NavBar': NavBar
  },
  mounted: {
    updateProgressBar () {
      setInterval(() => {
        this.progressValue++;
      }, 1000);
    }
  }
  
}
</script>
<style>
.searchBarBg .v-input__slot {
  background: rgba(0, 0, 0, 0.06) !important;
  caret-color: #343434 !important;
  color: #343434 !important;
}
</style>
