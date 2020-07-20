<template>
  <v-container fluid>
    <v-row class="mt-0 pt-0" align="center">
      <v-col cols="12"  align="center">
        <span style="font-size: 24px">My Favourites</span>
      </v-col>
    </v-row>
    <div>
      <v-text-field class="searchBarBg" v-model="search" rounded clearable flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"></v-text-field>
    </div>
    <template>
      <v-subheader v-once style="height: 20px" class="mt-3 mb-1 pl-1" v-text="customerInfo.favourites[0].restaurantName"></v-subheader>
      <v-list v-for="item in filteredList" :key="item.menuItemName" class="py-0">
        <v-list-item  ripple class="py-1 pr-0">
          <v-list-item-avatar tile  style="border-radius: 4px" size="45" >
            <v-img src="https://source.unsplash.com/hrlvr2ZlUNk/800x800/"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-html="item.menuItemName"></v-list-item-title>
            <v-list-item-subtitle v-html="item.menuItemDescription"></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action class="ml-0 mt-0">
            <v-btn icon>
              <v-icon color="primary">mdi-heart</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-divider divider class="ml-3" width="93%"></v-divider>
      </v-list>
    </template>
    <NavBar></NavBar>
  </v-container>

</template>

<script>
import NavBar from '@/components/layout/NavBar';
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'

class Favourite {
  constructor(menuItemName, menuItemDescription) {
    this.menuItemName
    this.menuItemDescription
  }
};

export default {
  data () {
    return {
      search: '',
      filter: {},
      sortBy: 'menuItemName',
      keys: [
        'menuItemName',
      ],
      favourites: [],
    }
  },
  methods: {
    removeFavourite() {
      removeFavourite
    }
  },
  computed: {
    ...mapGetters({
      customerInfo: 'CustomerStore/getCustomerProfile',
    }),
    ...mapActions({
      // removeFavourite: 'CustomerStore/removeFavourite',
    }),
    filteredKeys () {
      return this.keys.filter(key => key !== `menuItemName`)
    },
    filteredList() {
      return this.customerInfo.favourites.filter(favourite => {
        return favourite.menuItemName.toLowerCase().includes(this.search.toLowerCase())
      })
    }
  },
  components: {
    'NavBar': NavBar
  }
  
}
</script>
<style>
.searchBarBg .v-input__slot {
  background: rgba(0, 0, 0, 0.06) !important;
  caret-color: #343434 !important;
  color: #343434 !important;
}
</style>