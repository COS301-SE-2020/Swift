<template>
  <v-container fluid fill-height>
    <v-container v-if="qrCodeView == true" fluid fill-height>
      <v-btn width="30px" height="30px" @click="backNavigation" color="secondary" absolute small fab style="top: 30px; left: 25px">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <div class="row d-flex flex-column align-center">
        <div class="headline mb-6">Check into restaurant</div>
        <div class="subtitle-1">Place the Table QR Code inside the area</div>
        <div class="subtitle-2">Scanning will start automatically</div>
      </div>
      <div class="row d-flex flex-column align-center w-50">
        <qrcode-stream class="w-50" @decode="onQRDecode"></qrcode-stream>
      </div>
      <div class="row d-flex flex-column align-center">
        <v-row class="justify-space-around" style="width: 100%;">
          <!-- <v-col v-if="qrCodeView == true" cols="5" class="px-2">
            <v-btn style="width: 100%;" large @click="goToHome" rounded>Cancel</v-btn>
          </v-col> -->
          <v-col v-if="qrCodeView == true" cols="6" class="px-2">
            <v-btn style="width: 100%;" large rounded @click="toggleCheckInMethod()" color="primary">Check-in Manually</v-btn>
          </v-col>
        </v-row>
      </div>
    </v-container>
    <v-container v-if="qrCodeView == false" fluid fill-height>
      <v-btn width="30px" height="30px" @click="backNavigation" color="secondary" absolute small fab style="top: 30px; left: 25px">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <div class="row d-flex flex-column align-center">
        <div class="headline mb-6">Check into restaurant</div>

        <div class="subtitle-1">Enter the 7-character code</div>
        <div class="subtitle-2">You can find the code displayed on the table</div>
      </div>
      <div class="row d-flex flex-column align-center w-50">
        <v-col cols="10" lg="6">
          <v-text-field v-model="code" label="Table Code" required outlined></v-text-field>
        </v-col>
      </div>
      <div class="row d-flex flex-column align-center">
        <v-row class="justify-space-around" style="width: 100%;">
          <v-col cols="5" class="px-2">
            <v-btn style="width: 100%;" large @click="toggleCheckInMethod()" rounded>QRCode View</v-btn>
          </v-col>
          <v-col cols="5" class="px-2">
            <v-btn style="width: 100%;" large rounded @click="checkInManually(code)" color="primary">Enter Code</v-btn>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";

export default {
  data: () => ({
    code: '',
    qrCodeView: true
  }),
  methods: {
    goToHome() {
      this.$router.push("/")
    },
    backNavigation () {
      this.$router.go(-1)
    },
    async checkInManually(manualCode) {
      var data = {
        "code": manualCode
      }
      
      var response = await this.$store.dispatch('CustomerStore/checkInCustomerManually', data);
      this.$router.push("/menu/" + response.restaurantId);
    },
    async onQRDecode(result) {
      var data = {
        "qrcode": result
      }
      var response = await this.checkInCustomer(data);
      // console.log(response.restaurantId)
      this.$router.push("/menu/" + response.restaurantId);
    },
    toggleCheckInMethod() {
      this.qrCodeView = !this.qrCodeView;
    },
    ...mapMutations({
      setTable : 'RestaurantStore/setTableNumber',
      setCheckedInStatus : 'CustomerStore/SET_CHECKED_IN_STATUS',
      setCheckedInQRCode : 'CustomerStore/SET_CHECKED_IN_CODE',
      updateCheckInFlag : 'CustomerStore/UPDATE_CHECKED_IN',
    }),
    ...mapActions({
      checkInCustomer: 'CustomerStore/checkInCustomer',
      checkInCustomerManually: 'CustomerStore/checkInCustomerManually',
    }),
  },
};
</script>