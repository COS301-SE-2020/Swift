<template>
  <v-container fluid>
    <v-row class="mt-0 pt-0" align="center">
      <v-col cols="12"  align="center">
        <span style="font-size: 24px">Order History</span>
      </v-col>
    </v-row>
    <v-data-iterator :items="orderHistory[0].orderCategory.items"  :search="search" hide-default-footer>
      <template v-once v-slot:header>
        <v-text-field label="Search..." class="searchBarBg" rounded v-model="search" clearable flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" ></v-text-field>
      </template>

      <template v-slot:default="props" >
        <v-subheader style="height: 20px" class="mt-3 mb-1 pl-1"  v-text="orderHistory[0].orderCategory.status"></v-subheader>
        <v-list  v-for="item in props.items" :key="item.restaurant" class="py-2">
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

    <v-data-iterator :items="orderHistory[1].orderCategory.items"  :search="search" hide-default-footer>
      <template v-slot:default="props">
        <v-subheader style="height: 20px" class="mt-3 mb-1 pl-1"  v-text="orderHistory[1].orderCategory.status"></v-subheader>
        <v-list v-for="item in props.items" :key="item.restaurant" class="py-2">
          <v-card>
            <v-list-item ripple class="py-1 pr-0">
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
                <!-- <v-btn rounded small color="primary" class="mr-2">Re-order</v-btn> -->
                <v-btn rounded small>Rate</v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-list>
      </template>
    </v-data-iterator>

    <NavBar></NavBar>
  </v-container>

</template>

<script>
import NavBar from '@/components/layout/NavBar';

export default {
  data () {
    return {
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
  computed: {
    filteredKeys () {
      return this.keys.filter(key => key !== `Title`)
    },
  },
  components: {
    'NavBar': NavBar
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
