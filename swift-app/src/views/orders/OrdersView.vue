<template>
  <div class="orders">
     <v-card>
      <v-tabs v-model="tab" background-color="white" grow>
        <v-tab>
          Order Status
        </v-tab>
        <v-tab>
          Order History
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-card flat>
            <v-card-text>Tab 1 Content</v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <v-card-text>Tab 2 Content</v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
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
  }
}
</script>