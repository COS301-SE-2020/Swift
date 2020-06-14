<template>
<div class="cart" style="height:92%">
    <v-toolbar elevation='2'>
        <v-container>
            <v-row>
                <v-col cols='1' class="pl-0">
                    <v-btn icon @click="goToHome">
                        <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                </v-col>
                <v-col cols='11' class="pl-0 d-flex justify-center align-self-center">
                    <v-toolbar-title >Your Order</v-toolbar-title>
                </v-col>
            </v-row>
        </v-container>
    </v-toolbar>
    <v-container style="height:100%">
        <v-row v-for="(item, index) in items" :key="index">
            <v-col class="d-flex justify-center pb-1">
                <v-card width="95%">
                    <v-container py-0>
                        <v-row>
                            <v-col cols="4">
                                <v-avatar color="grey" size="65px">
                                    <img :src=item.img alt="">
                                </v-avatar>
                            </v-col>
                            <v-col cols="8" class="pl-0">
                                <v-row class="d-flex justify-space-between">
                                    <div class="body-2 secondary--text">{{item.name}}</div>
                                    <v-btn icon @click="goToHome" height="20" class="mr-1">
                                        <v-icon color="primary" size="20px">mdi-close</v-icon>
                                    </v-btn>
                                </v-row>
                                <v-row class="d-flex justify-space-between mt-5">
                                    <div class="body-2 secondary--text">R{{item.price}}</div>
                                    <div class="mr-3">
                                        <v-btn fab elevation="2" width="22px" height="22px" class="mr-2">
                                            <v-icon size="15px">mdi-minus</v-icon>
                                        </v-btn>
                                        <div class="body-2 secondary--text" style="display: inline;">1</div>
                                        <v-btn fab elevation="2" width="22px" height="22px" class="ml-2">
                                            <v-icon size="15px">mdi-plus</v-icon>
                                        </v-btn>
                                    </div>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
        <v-row class="mt-5">
            <v-col class="d-flex justify-center pb-1">
                <v-card width="95%" class="pa-1">
                    <v-container py-0>
                        <v-row>
                            <v-col cols="9" class="pb-0">
                                <div class="body-1 secondary--text">Subtotal</div>
                            </v-col>
                            <v-col cols="3" class="pb-0"> 
                                <div class="body-1 secondary--text d-flex justify-end">R180.00</div>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="9" class="pb-0">
                                <div class="body-1 secondary--text">Tax(14% VAT included)</div>
                            </v-col>
                            <v-col cols="3" class="pb-0">
                                <div class="body-1 secondary--text d-flex justify-end">R25.20</div>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="9">
                                <div class="body-1 secondary--text">Waiter Tip</div>
                            </v-col>
                            <v-col cols="3">
                                <div class="body-1 secondary--text d-flex justify-end">R18.00</div>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-divider></v-divider>
                        </v-row>
                        <v-row>
                            <v-col cols="9">
                                <div class="body-1 secondary--text font-weight-bold">Total</div>
                            </v-col>
                            <v-col cols="3">
                                <div class="body-1 secondary--text d-flex justify-end font-weight-bold">R{{this.orderTotal.toFixed(2)}}</div>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
        <v-row class="d-flex justify-space-around" style="position: absolute; width:100%; bottom: 0; margin-bottom: 33px">
            <v-col cols="5" class="pa-0">
                <v-btn rounded color="primary" elevation="2" class="mr-2 body-2" width="100%">Order Now, Pay Later</v-btn>
            </v-col>
            <v-col cols="5" class="pa-0">
                <v-btn rounded color="accent" elevation="2" class="mr-2 body-2" width="100%" @click="goToPayment">Pay Now</v-btn>
            </v-col>
        </v-row>
    </v-container>
    <NavBar></NavBar>
</div>
</template>

<script>
import { Store, mapMutations } from "vuex";
import NavBar from '@/components/layout/NavBar';

export default {
  data () {
    return {
        orderTotal: 223.20,
        tab: null,
        items: [
            { img: 'https://source.unsplash.com/uVPV_nV17Tw/800x800/', name: 'Buttermilk Chicken Burger', price: '95.00'},
            { img: 'https://source.unsplash.com/2NaeHe0-p1I/800x800/', name: 'Fruit Salad', price: '85.00'}
        ],
    }
  },
  components: {
    'NavBar': NavBar
  },
  methods: {
    goToHome () {
      this.$router.push('/')
    },
    goToPayment (){
        this.setTotal(this.orderTotal)
        this.$router.push('/pay')
    },
     ...mapMutations({
      setTotal : 'OrderStore/setOrderTotal'
    })
  },
}
</script>