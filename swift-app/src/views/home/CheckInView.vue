<template>
  <v-container fluid fill-height>
    <div class="row d-flex flex-column align-center">
      <div class="headline mb-6">Check into restaurant</div>
      <div class="subtitle-1">Place the QR Code inside the area</div>
      <div class="subtitle-2">Scanning will start automatically</div>
    </div>
    <div class="row d-flex flex-column align-center ">
      <v-icon color="secondary" size="130" >mdi-qrcode-scan</v-icon>
    </div>
    <div class="row d-flex flex-column align-center">
      <v-row class="justify-space-around">
        <v-col cols="6">
          <v-btn large @click=goToHome rounded>Cancel</v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn large rounded @click=goToRestaurant color="primary">Start Scan</v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>

</template>

<script>
  export default {
    methods: {
      goToRestaurant () {
        this.$router.push('/menu')
      },
      goToHome () {
        this.$router.push('/')
      },
    },
  }
</script>