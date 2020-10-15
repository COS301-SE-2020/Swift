<template>
  <v-container class="pl-0 pt-0 pr-0 pb-0 overflow-y-auto overflow-x-hidden" fluid>
    <v-card class="mx-auto pr-0 pl-0 pt-0 mt-0" height="65px" elevation="1" style="line-height: 2.9; border-radius: 0">
      <v-row class="mt-0 pt-0" align="center">
        <v-col cols="3" class="mt-0 pt-1 pr-0 pb-0">
          <v-btn @click="backNavigation" color="secondary" small text>
            <v-icon size="35">mdi-chevron-left</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="9" class="mt-0 pt-0 pr-0 pb-0" align="left">
          <span style="font-size: 27px">Payment Info</span>
        </v-col>
      </v-row>
    </v-card>

    <v-card v-if="type == 'Card'" flat class="mx-auto mt-2">
      <v-card v-if="creditCardInformation.length != 0" flat class="mx-auto">
        <v-row justify="center">
          <v-col cols="11" class="pt-0"> 
            <div style="font-size: 18px" class="font-weight-bold mt-1">Select Default Card</div>
          </v-col>
        </v-row>
        <v-row justify="center" v-for="(card, index) in creditCardInformation" :key="index">
          <v-col cols="11" class="pt-1">
            <v-btn @click="changeCard(index)" color="white" class="pt-0 rounded-card" height="60px" width="100%" align="center">
                <v-row align="center" class="pt-0 pb-0">
                  <v-col cols="2" align="left" class="pl-4 pt-0 pb-0">
                    <v-avatar justify="center">
                      <img v-if="card.type == 'MasterCard'" src='../../assets/payment/mastercard-logo.svg' alt />
                      <img v-else src='../../assets/payment/visa-logo.png' alt />
                    </v-avatar>
                  </v-col>
                  <v-col cols="7" align="left" class="pl-7 pt-0 pb-0">
                    <span class="subtitle-1 font-weight-light" style="font-size: 17px !important;">***** **** **** {{card.digits}}</span>
                  </v-col>
                  <v-col cols="3" class="pr-2 pt-0 pb-0" align="center">
                    <v-icon class="lockIcon" v-text="card.selected ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"></v-icon>
                  </v-col>
                </v-row>
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="11" class="pr-0 pt-1">
            <v-btn text @click="addCard" class="pr-0" style="float: right !important;">
              <p class="body-1 float-right" color="secondary"><u>Add Card</u></p>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
      <v-card v-else flat class="mx-auto pt-4 pb-6">
        <v-row justify="center" class="mt-1">
          <v-avatar size="110px" color="#F5F5F5" justify="center">
            <v-icon color="primary" class="lockIcon" size="55">mdi-credit-card-outline</v-icon>
          </v-avatar>
        </v-row>
        <v-row class="mt-5" justify="center">
          <span style="font-size: 27px">Don't have a card yet?</span>
        </v-row>
        <v-row justify="center" class="mt-2 mb-6">
          <span style="font-size: 16px; text-align: center; opacity: 0.9" class="font-weight-light">You can easily add one here.</span>
        </v-row>
        <v-row justify="center">
          <v-col cols="11" class="pr-0 pt-1 pl-0" align="center">
            <v-btn text @click="addCard" class="pr-0">
              <p class="body-1" color="secondary"><u>+ Add Card</u></p>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-card>

  </v-container>
</template>


<script>
import NavBar from "@/components/layout/NavBar";
import { mapActions, mapGetters, mapMutations } from "vuex";

export default {
    components: {
      NavBar: NavBar
    },
    data() {
    return {
      selected: false,
      paymentMade: false,
      type: "Card",
      selectedItemPublic: [],
      orderTotal: 0,
      creditCardInformation: [
        {
          type: "MasterCard",
          digits: "3198",
          selected: true
        },
        {
          type: "MasterCard",
          digits: "8901",
          selected: false
        },
        {
          type: "Visa",
          digits: "2045",
          selected: false
        }
      ],
      nfcInformation: [
        {
          type: "Zapper",
          selected: true
        },
        {
          type: "Snapscan",
          selected: false
        }
      ]
    }
  },
  methods: {
    requestReceipt () {

    },
    changeType: function(newType) {
      this.type = newType
    },
    changeCard: function(index) {
      for (var i = 0; i < this.creditCardInformation.length; i++) 
        this.creditCardInformation[i].selected = false;
      this.creditCardInformation[index].selected = true;
    },
    changeNFC: function(index) {
      for (var i = 0; i < this.nfcInformation.length; i++) 
        this.nfcInformation[i].selected = false;
      this.nfcInformation[index].selected = true;
    },
    addCard() {
      this.$router.push('addCard')
    },
    backNavigation () {
      this.$router.go(-1)
    },
    hideAlert () {
      this.submitPayment()
      this.updateOrderFlag(false);
      this.$router.push('/orders')
    },
    calculateTotal() {
      // console.log(this.paymentInfo().waiterTip)
      return (parseFloat((this.paymentInfo().amountPaid != null) ? this.paymentInfo().amountPaid : 0)).toFixed(2)
    },
    showPopUp() {
      // console.log(this.orderFlag())
      return this.orderFlag()
    },
    goToPayment (){
      this.setTotal(this.calculateTotal())
      // this.paymentMade = !this.paymentMade
      this.$router.push('pay')
    },
    ...mapMutations({
      setTotal : 'OrderStore/setOrderTotal'
    }),
    ...mapActions({
      submitPayment: 'OrderStore/submitPayment',
      updateOrderFlag: 'OrderStore/updateOrderFlag',
    }),
    ...mapGetters({
      paymentInfo: 'OrderStore/getPaymentInfo',
      orderFlag: 'OrderStore/getOrderFlag'
    }),
  },
  computed: {
    selectTab () {
      if (!this.favourited) {
        return 'mdi-heart-outline'
      } else {
        return 'mdi-heart'
      }
    },
  },
};
</script>

<style>
:before {
  background-color: transparent !important;
}

.rounded-card {
  border-radius:10px !important;
}
</style>
    