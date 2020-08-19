<template>
  <v-container fluid fill-height>
    <div class="row d-flex flex-column align-center">
      <div class="headline mb-6">Check into restaurant</div>
      <div class="subtitle-1">Place the Table QR Code inside the area</div>
      <div class="subtitle-2">Scanning will start automatically</div>
    </div>
    <div class="row d-flex flex-column align-center w-50">
      <qrcode-stream class="w-50" @decode="onQRDecode"></qrcode-stream>
    </div>
    <div class="row d-flex flex-column align-center">
      <v-row class="justify-space-around">
        <v-col cols="6">
          <v-btn large @click="goToHome" rounded>Cancel</v-btn>
        </v-col>
        <v-col cols="6">
          <!-- TODO: Manual Table input popup -->
          <v-btn large rounded @click="goToRestaurant" color="primary">Enter Manually</v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";

export default {
  methods: {
    goToRestaurant(restaurantId) {
      this.updateCheckInFlag(true);
      this.$store.dispatch('RestaurantsStore/retrieveRestaurantMenu', restaurantId);
      this.$router.push("/menu/" + restaurantId)
    },
    goToHome() {
      this.$router.push("/")
    },
    async onQRDecode(result) {
      var data = {
        "qrcode": result
      }
      var response = await this.checkInCustomer(data);
      
      this.goToRestaurant(response.restaurantId);
    },
    ...mapMutations({
      setTable : 'RestaurantStore/setTableNumber',
      setCheckedInQRCode : 'CustomerStore/SET_CHECKED_IN_CODE',
    }),
    ...mapActions({
      checkInCustomer: 'CustomerStore/checkInCustomer',
      updateCheckInFlag: 'CustomerStore/UPDATE_CHECKED_IN',
    }),
  },
};
</script>