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
  <v-container style="height: 80%">
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
    <v-row class="overflow-y-auto mt-0 justify-space-between" style="text-align: center">
        <v-col cols="12">
            <v-btn @click="goToHome" style="text-align: center" class="mt-6 body-2 align-self-center" height="53px" width="110px" rounded color="primary">View Order</v-btn>
        </v-col>
    </v-row>
  </v-container>
  <NavBar></NavBar>
</div>
</template>

<script>
import NavBar from '@/components/layout/NavBar';

export default {
  data () {
    return {
      tab: null,
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