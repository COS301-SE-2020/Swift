<template>
<div class="orders" style="height:100%;">
  <v-container py-0>
    <div class="row d-flex flex-column align-stretch align-self-center">
      <v-card flat>
        <v-tabs v-model="tab" background-color="white" grow>
          <v-tab>
            Order Status
          </v-tab>
          <v-tab>
            Order History
          </v-tab>
        </v-tabs>
      </v-card>
    </div>
  </v-container>
  <v-container py-0 class="align-self-stretch" style="height:100%;">
    <div class="row d-flex flex-column align-stretch align-self-stretch" style="height:100%;">
      <v-tabs-items v-model="tab" style="width:96%; height:100%;">
        <v-tab-item style="height:100%;">
          <v-container fluid fill-height class="pa-0">
            <div class="row d-flex flex-column align-self-center align-center">
              <v-btn class="mb-8" height="140px" width="140px" fab color="primary">
                <v-icon size="65px" class="font-weight-light">mdi-cart-outline</v-icon>
              </v-btn>
              <div class="headline mb-3 mt-12 secondary--text">Order Empty</div>
              <div class="subtitle-1 secondary--text">Order some food or drinks here:</div>
              <v-btn @click="goToHome" class="mt-6" height="53px" width="100px" rounded large color="primary">Menu</v-btn>
            </div>
          </v-container>
        </v-tab-item>
        <v-tab-item style="height:100%;">
          <v-container fluid fill-height class="pa-0">
            <div class="row d-flex flex-column justify-center align-center">
              <v-btn class="mb-8" height="140px" width="140px" fab color="primary">
                <v-icon size="65px" class="font-weight-light">mdi-cart-outline</v-icon>
              </v-btn>
              <div class="headline mb-3 mt-12 secondary--text">Order Empty</div>
              <div class="subtitle-1 secondary--text">Order some food or drinks here:</div>
              <v-btn @click="goToHome" class="mt-6" height="53px" width="100px" rounded large color="primary">Menu</v-btn>
            </div>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
  <NavBar></NavBar>
</div>
</template>

<script>
import NavBar from '@/components/layout/NavBar';

export default {
  data () {
    return {
      tab: null,
    }
  },
  components: {
    'NavBar': NavBar
  },
  methods: {
    goToHome () {
      this.$router.push('/')
    },
  },
}
</script>