<template>
  <v-container class="pl-0 pt-0 pr-0 pb-0 overflow-y-auto overflow-x-hidden" fluid>
    <DesktopPaymentInformation v-if="!isMobile"></DesktopPaymentInformation>
    <v-container v-if="isMobile" class="pa-0">
      <v-card class="mx-auto pr-0 pl-0 pt-0 mt-0" height="65px" elevation="1" style="line-height: 2.9; border-radius: 0">
        <v-row class="mt-0 pt-0" align="center">
          <v-col cols="3" class="mt-0 pt-1 pr-0 pb-0">
            <v-btn @click="backNavigation" color="secondary" small text>
              <v-icon size="35">mdi-chevron-left</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="9" class="mt-0 pt-0 pr-0 pb-0" align="left">
            <span style="font-size: 27px">Payment Method</span>
          </v-col>
        </v-row>
      </v-card>
    
      <v-card flat class="mx-auto">
        <v-row justify="center" class="mt-3 mb-3" style="text-align:center">
          <v-col cols="3" class="pl-1 pr-1" style="text-align: center">
            <v-btn retain-focus-on-click @click="changeType('Card')" fab elevation="2" size="60px" :color="type == 'Card' ? 'white' : 'black'" justify="center">
              <v-icon :color="type == 'Card' ? 'primary' : 'white'" class="lockIcon" size="30">mdi-credit-card-outline</v-icon>
            </v-btn>
            <div style="font-size: 17px" class="font-weight-light mt-1">Card</div>
          </v-col>
          <v-col cols="3" class="pl-1 pr-1">
            <v-btn @click="changeType('NFC')" fab elevation="2" size="60px" :color="type == 'NFC' ? 'white' : 'black'" justify="center">
              <v-icon :color="type == 'NFC' ? 'primary' : 'white'" class="lockIcon" size="30">mdi-scan-helper</v-icon>
            </v-btn>
            <div style="font-size: 17px" class="font-weight-light mt-1">NFC</div>
          </v-col>
          <v-col cols="3" class="pl-1 pr-1"> 
            <v-btn @click="changeType('Cash')" fab elevation="2" size="60px" :color="type == 'Cash' ? 'white' : 'black'" justify="center">
              <v-icon :color="type == 'Cash' ? 'primary' : 'white'" class="lockIcon" size="30">mdi-cash-multiple</v-icon>
            </v-btn>
            <div style="font-size: 17px" class="font-weight-light mt-1">Cash</div>
          </v-col>
        </v-row>
      </v-card>

      <v-card v-if="type == 'Card'" flat class="mx-auto">
        <v-card v-if="creditCardInformation.length != 0" flat class="mx-auto">
          <v-row justify="center">
            <v-col cols="11" class="pt-0"> 
              <div style="font-size: 18px" class="font-weight-bold mt-1">Select Card</div>
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

      <v-card v-else-if="type == 'NFC'" flat class="mx-auto">
        <v-row justify="center">
          <v-col cols="11" class="pt-0"> 
            <div style="font-size: 18px" class="font-weight-bold mt-1">Select NFC type</div>
          </v-col>
        </v-row>
        <v-row justify="center" v-for="(nfc, index) in nfcInformation" :key="index">
          <v-col cols="11" class="pt-1">
            <v-btn @click="changeNFC(index)" color="white" class="pt-0 rounded-card" height="60px" width="100%" align="center">
              <v-row align="center" class="pt-1">
                <v-col cols="2" align="left" class="pl-4 pt-0 pb-0">
                  <v-avatar justify="center" size="40px">
                    <img v-if="nfc.type == 'Zapper'" src='../../assets/payment/zapper-logo.png' alt />
                    <img v-else src='../../assets/payment/snapscan-logo.png' alt />
                  </v-avatar>
                </v-col>
                <v-col cols="7" align="left" class="pl-7 pt-0 pb-0">
                  <span class="subtitle-1 font-weight-light" style="font-size: 17px !important;">{{nfc.type}}</span>
                </v-col>
                <v-col cols="3" class="pr-2 pt-0 pb-0" align="center">
                  <v-icon class="lockIcon" v-text="nfc.selected ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"></v-icon>
                </v-col>
              </v-row>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-card flat class="mx-auto mt-4" >
        <v-row>
          <v-col cols="12" class="pr-0 pt-1 pb-0" align="center">
            <div style="font-size: 27px; text-align: center" class="mt-1">Total: R{{calculateTotal()}}</div>
            <v-btn @click="toggleAlert" v-if="type == 'Cash'" class="mt-6 subtitle-1" height="50px" width="180px" rounded large color="accent">Request Bill</v-btn>
            <v-btn @click="toggleAlert" v-else class="mt-6 subtitle-1" height="50px" width="180px" rounded large color="accent">Pay Now</v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-overlay relative opacity="0.25" :value="paymentMade" z-index="10">
        <v-avatar elevation="3" color="accent" class="pl-0 pr-0" absolute style="position: absolute; z-index: 12">
            <v-icon size="33px" color="white" v-text="'mdi-check'"></v-icon>
        </v-avatar>
        <v-alert color="white" transition="scale-transition" class="alert" align="center" style="margin-top: 20px;">
          <div style="font-size: 22px !important; color: #343434;" class="pl-8 pr-8 mt-8">Proceed with payment?</div>
          <div class="mt-2" style="font-size: 16px !important; color: #343434">Please note that once you make payment, <br/>you will be checked out of the system.</div>
          <v-row justify="center">
            <v-col cols="12" class="d-flex justify-space-around" flat>
              <v-btn text @click="toggleAlert" class="mt-6 mb-1">
                <div class="font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline; text-align: center">Cancel</div>
              </v-btn>
              <v-btn text @click="goToPayment" class="mt-6 mb-1">
                <div class="font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline; text-align: center">Continue</div>
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-overlay>

      <v-overlay relative opacity="0.25" :value="showPopUp()" z-index="10">
        <v-avatar elevation="3" color="accent" class="pl-0 pr-0" absolute style="position: absolute; z-index: 12">
          <v-icon size="33px" color="white" v-text="'mdi-check'"></v-icon>
        </v-avatar>
        <v-alert color="white" transition="scale-transition" class="alert" align="center" style="margin-top: 20px">
          <div style="font-size: 22px !important; color: #343434" class="pl-8 pr-8 mt-8">Payment successful</div>
          <div class="mt-2" style="font-size: 16px !important; color: #343434">You successfully paid for your order.</div>
          <div class="mt-2" style="font-size: 22px !important; color: #343434">R{{calculateTotal()}}</div>
          <v-btn text @click="hideAlert" class="mt-6 mb-1">
            <div class="font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline">Continue</div>
          </v-btn>
        </v-alert>
      </v-overlay>
    </v-container>

  </v-container>
</template>


<script>
import NavBar from "@/components/layout/NavBar";
import { mapActions, mapGetters, mapMutations } from "vuex";
import DesktopPaymentInformation from "../../components/payment/DesktopPaymentInformation"

export default {
    components: {
      NavBar: NavBar,
      'DesktopPaymentInformation': DesktopPaymentInformation,
    },
    data() {
    return {
      selected: false,
      paymentMade: false,
      isMobile: false,
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
    // requestReceipt () {
    //   this.paymentMade = !this.paymentMade
    // },
    onResize () {
      this.isMobile = window.innerWidth < 600
    },
    toggleAlert() {
        this.paymentMade = !this.paymentMade
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
    async hideAlert () {
      // await this.$store.dispatch('OrderStore/submitPayment');
      // console.log('ordered')
      // console.log(this.orderFlag())
      await this.$store.dispatch('OrderStore/updateOrderFlag', false);
      
      await this.$store.dispatch('CustomerStore/checkOutCustomer');
      await this.$store.commit('CustomerStore/SET_CHECKED_IN_TABLE_ID', null);
      await this.$store.commit('CustomerStore/SET_CHECKED_IN_CODE', null);
      await this.$store.commit('CustomerStore/SET_CHECKED_IN_RESTAURANT_ID', null);
      this.$router.push('/orders')
    },
    calculateTotal() {
      // console.log(this.paymentInfo().waiterTip)
      return (parseFloat((this.paymentInfo().amountPaid != null) ? this.paymentInfo().amountPaid : 0)).toFixed(2)
    },
    showPopUp() {
      // console.log("in here2")
      // console.log(this.orderFlag())
      return this.orderFlag()
    },
    async goToPayment (){
      
      this.setPaymentMethod(this.type)
      this.setTotal(this.calculateTotal())
      await this.updateOrderFlag(true);
      this.toggleAlert()
      if (this.type == 'Card') {
        this.$router.push('pay')
      } else {
        await this.submitPayment();
      }
    },
    ...mapMutations({
      setTotal : 'OrderStore/setOrderTotal',
      setCheckedInTableId : 'CustomerStore/SET_CHECKED_IN_TABLE_ID',
      setCheckedInQRCode : 'CustomerStore/SET_CHECKED_IN_CODE',
      setCheckedInRestaurantId : 'CustomerStore/SET_CHECKED_IN_RESTAURANT_ID',
    }),
    ...mapActions({
      submitPayment: 'OrderStore/submitPayment',
      updateOrderFlag: 'OrderStore/updateOrderFlag',
      checkout: 'CustomerStore/checkOutCustomer',
      setPaymentMethod: 'OrderStore/changePaymentType',
    }),
    ...mapGetters({
      paymentInfo: 'OrderStore/getPaymentInfo',
      orderFlag: 'OrderStore/getOrderFlag',
    }),
  },
  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
    if (Object.keys(this.paymentInfo()).length != 0) {
      
    } else {
      this.$router.push("/orders");
    }
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
    