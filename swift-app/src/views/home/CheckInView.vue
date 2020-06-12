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
      <!-- TODO: Move Snackbar to MenuHomeView -->
       <!--snackbar shows table number on successful checkin -->
      <v-snackbar
        absolute
        centered
        color="primary"
        elevation="24"
        v-model="snackbar"
      >{{ qrResult }}</v-snackbar>
    </div>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    snackbar: false,
    qrResult: ""
  }),
  methods: {
    goToRestaurant() {
      this.$router.push("/menu");
    },
    goToHome() {
      this.$router.push("/");
    },
    onQRDecode(result) {
      this.snackbar = true;
      this.qrResult = result;
      setTimeout(() => {  this.goToRestaurant(); }, 2000);
     
    }
  }
};
</script>