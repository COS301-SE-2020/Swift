<template>
  <v-container fluid>
      <v-container>
        <v-card class="mx-auto" flat>
          <v-row class="mt-3">
            <v-col cols="3" class="mt-0 pt-0 pr-0 pl-0">
              <v-btn @click="backNavigation" color="secondary" small text>
                <v-icon size="37">mdi-chevron-left</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
        <v-card flat tile>
          <v-card class="mx-auto" flat>
            <v-row justify="center" class="mt-1">
              <v-avatar size="180px" color="#F5F5F5" justify="center">
                <v-icon color="primary" size="100">mdi-map-marker</v-icon>
              </v-avatar>
            </v-row>
            <v-row class="mt-12" justify="center">
              <span  style="font-size: 25px">Enable Location</span>
            </v-row>
            <v-row justify="center" class="mt-4 mb-6">
              <span style="font-size: 16px; text-align: center; opacity: 0.7" class="font-weight-light">Enable your phone's location to show the restaurant's nearest you</span>
            </v-row>
          </v-card>
        </v-card>
        <v-row class="mt-6 mb-4" justify="center">
          <v-col cols="11" class="pt-0 mb-10" width="100%" style="position: absolute; bottom: 0;">
            <v-row class="d-flex justify-space-around">
              <v-col cols="5" class="pa-0" align="center">
                <v-btn rounded color="white" elevation="2" class="mr-2 body-2" width="90%" height="41px" style="font-size: 16px !important" @click="redirectToHome">Not Now</v-btn>
              </v-col>
              <v-col cols="5" class="pa-0" align="center">
                <v-btn rounded color="accent" elevation="2" class="mr-2 body-2" width="90%" height="41px" style="font-size: 16px !important" @click="enableLocation">Enable</v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";

export default {
    data() {
    return {
     
    }
  },
  methods: {
    backNavigation () {
      this.$router.pop()
    },
    redirectToHome () {
      this.$router.push('/')
    },
    enableLocation () {
      this.$router.push('/')
    },
  },
  computed: {
  
  },
};
</script>
