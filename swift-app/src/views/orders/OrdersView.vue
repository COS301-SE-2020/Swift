<template>
<div class="orders" style="height:100%;">
  <v-container py-0>
    <div class="row d-flex flex-column align-stretch align-self-center">
      <v-card flat>
        <v-tabs v-model="tab" background-color="white" grow>
          <v-tab>
            Order Status
          </v-tab>
          <v-tab>
            Order History
          </v-tab>
        </v-tabs>
      </v-card>
    </div>
  </v-container>
  <v-tabs-items v-model="tab" style="width:96%; height:96%;">
    <v-tab-item style="width:100%; height:100%;">
      <v-container v-show="orderPlaced">
        <v-row class="overflow-y-auto mt-3" justify="center" style="text-align: center">
            <v-col cols="12">
                <div class="headline mb-1 secondary--text">Order Status</div>
                <div class="body-2 secondary--text">Order No: 53234</div>
            </v-col>
        </v-row>
        <v-row class="mt-2 ml-1 pr-0">
            <v-col cols="5" class="pb-0">
                <div class="mt-2 body-2 secondary--text">Order Placed</div>
                <div class="secondary--text" style="font-size:10px"><v-icon size="13px" class="font-weight-light">mdi-clock-time-four-outline</v-icon> 10:30AM, 20 June 2020</div>
            </v-col>
            <v-col cols="7" class="pb-0 pl-0">
                <v-icon size="45px" class="pb-0 font-weight-light" color="primary">mdi-clock-time-four</v-icon>
            </v-col>
        </v-row>
        <v-row style="text-align: center; line-height:0" v-for="i in 4" :key=i>
            <v-col cols="12" class="ma-0 pa-0">
                <v-icon size="13px" class="font-weight-light ma-0 pa-0" style="transform:rotate(90deg)" color="primary">mdi-minus</v-icon>
            </v-col>
        </v-row>
        <v-row class="mt-2 ml-1 pr-0">
            <v-col cols="5" class="mb-0 mt-0 pb-0 pt-0">
                <div class="mt-2 body-2 secondary--text">Order Done</div>
                <div class="secondary--text" style="font-size:10px"><v-icon size="13px" class="font-weight-light">mdi-clock-time-four-outline</v-icon> 35 minutes</div>
                <div class="secondary--text" style="font-size:10px">Your food was prepared by Chef Andreas Alexis</div>
            </v-col>
            <v-col cols="7" class="mb-0 mt-0 pb-0 pt-0 pl-0">
                <v-avatar color="primary" size="39px" class="ma-0 pa-0">
                    <v-icon size="23px" class="font-weight-light ma-0 pa-0" color="white">mdi-pot-steam</v-icon>
                </v-avatar>
            </v-col>
        </v-row>
        <v-row style="text-align: center; line-height:0" v-for="i in 4" :key=i>
            <v-col cols="12" class="ma-0 pa-0">
                <v-icon size="13px" :value=i class="font-weight-light ma-0 pa-0" style="transform:rotate(90deg)" color="primary">mdi-minus</v-icon>
            </v-col>
        </v-row>
        <v-row class="mt-2 ml-1 pr-0">
            <v-col cols="5" class="mb-0 mt-0 pb-0 pt-0">
                <div class="mt-2 body-2 secondary--text">Order Received</div>
                <div class="secondary--text" style="font-size:10px"><v-icon size="13px" class="font-weight-light">mdi-clock-time-four-outline</v-icon> 11:03AM, 20 June 2020</div>
            </v-col>
            <v-col cols="7" class="mb-0 mt-0 pb-0 pt-0 pl-0">
                <v-avatar color="primary" size="39px" class="ma-0 pa-0">
                    <v-icon size="20px" class="font-weight-light ma-0 pa-0" color="white">mdi-chef-hat</v-icon>
                </v-avatar>
            </v-col>
        </v-row>
        <v-row class="overflow-y-auto mt-0 justify-space-between" style="text-align: center; position: absolute; width:100%; bottom: 0; margin-bottom: 25px">
            <v-col cols="12">
                <v-btn @click="goToHome" style="text-align: center" class="body-2 align-self-center" height="53px" width="110px" rounded color="primary">View Order</v-btn>
            </v-col>
        </v-row>
      </v-container>
      <v-container v-show="!orderPlaced" fluid fill-height class="pa-0">
        <div class="row d-flex flex-column align-self-center align-center">
          <v-avatar class="mb-8" height="140px" width="140px" fab color="primary">
            <v-icon size="65px" class="font-weight-light" color="white">mdi-cart-outline</v-icon>
          </v-avatar>
          <div class="headline mb-3 mt-12 secondary--text">Order Empty</div>
          <div class="subtitle-1 secondary--text">Order some food or drinks here:</div>
          <v-btn @click="goToHome" class="mt-6" height="53px" width="100px" rounded large color="primary">Menu</v-btn>
        </div>
      </v-container>
    </v-tab-item>
    <v-tab-item style="height:100%;">
      <v-container fluid fill-height class="pa-0">
        <div class="row d-flex flex-column justify-center align-center">
          No orders
        </div>
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
      orderPlaced: true,
    }
  },
  components: {
    'NavBar': NavBar
  },
  methods: {
    goToHome () {
      this.$router.push('/')
    },
  },
}
</script>