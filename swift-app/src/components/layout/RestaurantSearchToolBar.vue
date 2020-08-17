<template>
  <div class="toolbar">
    <v-card color="grey lighten-4" flat :height=toolbarHeight tile>
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="title pl-1">Welcome, {{customerInfo.name}} {{customerInfo.surname}}</div>
          </v-col>
        </v-row>
        <v-row no-gutters d-flex flex-row >
          <v-col cols="12">
            <v-text-field class="searchBarBg pb-2" v-model="search" rounded clearable solo-inverted hide-details label="Search..." background-color="white"></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

  export default {
    data: () => ({
      search: '',
      tab: null,
    }),
    computed: {
    ...mapGetters({
      customerInfo: 'CustomerStore/getCustomerProfile',
    }),
  },
} 
</script>
