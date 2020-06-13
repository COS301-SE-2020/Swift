<template>
 <div id="app">
    <div id="iframe-wrapper">
      <iframe 
        id="payfastIframe"
        :src="payfast.url"
        style="width:100%;height:100%;min-height:1200px"
        type="application/pdf"
        frameborder="0"
        @load="iframeLoad()"
      ></iframe>
    </div>
    <NavBar></NavBar>
  </div>
</template>

<script>
import NavBar from '@/components/layout/NavBar';

export default {
  data () {
    return {
        loadCount: 0,
        payfast:{
            //todo store and retrieve item_name and amount
            url: "http://sandbox.payfast.co.za/eng/process?cmd=_paynow&receiver=10009935&item_name=FoodOrder&amount=5000.00&return_url=https%3A%2F%2Fswiftapp.ml%2F&cancel_url=https%3A%2F%2Fswiftapp.ml%2F"
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
    goToHome () {
      this.$router.push('/')
    },
  },
}
</script>
