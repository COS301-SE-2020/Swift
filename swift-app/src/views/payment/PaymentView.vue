<template>
 <div id="app">
    <div id="iframe-wrapper">
      <iframe 
        id="payfastIframe"
        :src="payfast.urlPart1+this.orderTotal+payfast.urlPart2"
        style="width:100%;height:100%;min-height:1200px"
        type="application/pdf"
        frameborder="0"
        @load="iframeLoad()"
      ></iframe>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import NavBar from '@/components/layout/NavBar';

export default {
  data () {
    return {
        loadCount: 0,
        payfast:{
          //url gets concatinated with payment amount
          //should possibly move to computed section
          urlPart1: "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&receiver=10009935&item_name=Swift%20Order&amount=",
          urlPart2: "&return_url=https%3A%2F%2Fswiftapp.ml%2F&cancel_url=https%3A%2F%2Fswiftapp.ml%2F"
        }
    }
  },
  components: {
    'NavBar': NavBar
  },
  methods: {
    iframeLoad(){
        //count the amount of iframe redirects. 
        //On redirect 3 payment has been completed.
        this.loadCount++;
        if(this.loadCount == 3)
          this.goToHome();
    },
    async goToHome () {
      
      await this.submitPayment();
      this.$router.push('/paymentInformation')
    },
    ...mapActions({
      
      submitPayment: 'OrderStore/submitPayment',
    }),
  },
  computed: {
    ...mapGetters({
      orderTotal: "OrderStore/getOrderTotal"
    })
  }
}
</script>
