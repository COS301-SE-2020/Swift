<template>
  <v-container fluid fill-height>
    <div class="row d-flex flex-column align-center">
      <div class="headline mb-6">Check into restaurant</div>
      <div class="subtitle-1">Place the Table QR Code inside the area</div>
      <div class="subtitle-2">Scanning will start automatically</div>
    </div>
    <div class="row d-flex flex-column align-center w-50">
      <qrcode-stream class="w-50" @decode="onQRDecode" @init="onQRInit"></qrcode-stream>
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
    goToRestaurant() {
      this.updateDisplayNotification(true);
      this.updateCheckInFlag(true);
      this.$router.push("/menu")
    },
    goToHome() {
      this.$router.push("/")
    },
    onQRDecode(result) {
      this.setTable(result);
      this.goToRestaurant();
    },
    ...mapMutations({
      setTable : 'RestaurantsStore/setTableNumber',
    }),
    ...mapActions({
      updateCheckInFlag: 'RestaurantsStore/updateCheckInFlag',
      updateDisplayNotification: 'RestaurantsStore/updateDisplayNotification',
    }),
  },
};
</script>