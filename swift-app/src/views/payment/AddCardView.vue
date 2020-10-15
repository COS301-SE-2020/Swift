<template>
  <v-container fluid class="pl-0 pr-0 pb-0 overflow-y-auto overflow-x-hidden" style="height: 100vh; display: flex; flex-direction: column">
    <DesktopAddCard v-if="!isMobile"></DesktopAddCard>
    <v-container v-if="isMobile" class="pa-0">
      <v-card class="mx-auto ml-0" flat>
          <v-row class="mt-3">
            <v-col cols="3" class="mt-0 pt-0 pr-0 pl-4">
                <v-btn @click="backNavigation" color="secondary" small text>
                  <v-icon size="37">mdi-chevron-left</v-icon>
                </v-btn>
            </v-col>
          </v-row>
      </v-card>
      <v-card flat tile width="100%" style="height: 100%; display: flex; flex-direction: column;" >
        <v-card class="mx-auto" flat style="display: flex; flex-direction: column; flex: 1">
          <v-row justify="center" class="mt-1">
            <v-avatar size="180px" color="#F5F5F5" justify="center">
              <v-icon color="primary" class="lockIcon" size="110">mdi-credit-card-outline</v-icon>
            </v-avatar>
          </v-row>
          <v-row class="mt-4" justify="center">
            <v-col>
              <div style="font-size: 28px; text-align: center">Add Card</div>
              <div style="font-size: 16px; text-align: center; opacity: 0.9;" class="font-weight-light mt-3">Please enter the details of your <br /> Credit or Debit Card</div>
            </v-col>
          </v-row>
          <v-row align="center" class="mt-0 mb-0 mr-0 ml-0" width="100%" >
            <v-card class="mx-auto mr-0 ml-0 " flat color="#F5F5F5" align="center" style="border-top-left-radius: 25px; border-top-right-radius: 25px" height="100%">
              <v-row justify="center" class="mt-6">
                <v-col cols="10" class="pr-0 pl-0" align="center">
                  <v-text-field background-color="white" maxlength="16" label="Card Number" rounded dense single-line prepend-inner-icon="mdi-credit-card-outline" height="45px" style="border-radius: 30px"></v-text-field>
                </v-col>
              </v-row>
              <v-row class="d-flex justify-space-around">
                <v-col cols="5" class="pr-0 pl-4" align="center">
                  <v-text-field class="pr-0 dateInput" background-color="white" label="MM/YY" rounded dense single-line append-icon="mdi-help-circle-outline" height="45px" style="border-radius: 30px"></v-text-field>
                </v-col>
                <v-col cols="5" class="pr-4 pl-0" align="center">
                  <v-text-field background-color="white" maxlength="3" label="CVV" rounded dense single-line append-icon="mdi-help-circle-outline" height="45px" style="border-radius: 30px"></v-text-field>
                </v-col>
              </v-row>
              <v-row class="mt-2" justify="center">
                <v-col cols="10" class="pt-0 pl-0 d-flex justify-start" width="100%">
                  <v-btn icon @click="checked = !checked">
                    <v-icon size="20px" color="secondary" v-text="(checked ? 'mdi-check-box-outline' : 'mdi-checkbox-blank-outline')"></v-icon>
                  </v-btn>
                  <span class="subtitle-1 font-weight-light pt-1" style="font-size: 17px !important;">Set as default card</span>
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="10" class="pr-0 pl-0" align="center">
                  <v-btn @click="addCard" block rounded class="py-5 body-2 font-weight-light" color="primary" style="font-size: 17px !important">Add Card</v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-row>
        </v-card>
      </v-card>
    </v-container>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import $ from 'jquery';
import DesktopAddCard from "../../components/payment/DesktopAddCard"

export default {
  components: {
    'DesktopAddCard': DesktopAddCard,
  },
  data() {
    return {
     checked: true,
     isMobile: false,
    }
  },
  methods: {
    backNavigation () {
      this.$router.go(-1)
    },
    addCard () {
      this.$router.push('paymentInformation')
    },
    onResize () {
      this.isMobile = window.innerWidth < 600
    },
  },
  computed: {
  
  },
  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  },
};
</script>

<style>
.v-input__icon > .mdi-credit-card-outline::before {
  padding-top: 16px;
}

.v-input__icon > .mdi-help-circle-outline::before {
  padding-top: 16px;
  font-size: 15px;
}

.v-text-field--rounded > .v-input__control > .v-input__slot {
  padding-right: 10px;
}
