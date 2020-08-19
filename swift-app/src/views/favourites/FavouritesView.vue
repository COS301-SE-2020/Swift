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
    <template v-if="!isLoading && customerInfo.favourites.length != 0">
      <v-subheader v-once style="height: 20px" class="mt-3 mb-1 pl-1" v-text="customerInfo.favourites[0].restaurantName"></v-subheader>
      <v-list v-for="item in filteredList" :key="item.menuItemName" class="py-0">
        <v-list-item class="py-1 pr-0">
          <v-list-item-avatar @click="goToMenuItem(item.menuItemId)" tile  style="border-radius: 4px" size="45" >
            <v-img src="https://source.unsplash.com/hrlvr2ZlUNk/800x800/"></v-img>
          </v-list-item-avatar>
          <v-list-item-content ripple @click="goToMenuItem(item.menuItemId)">
            <v-list-item-title v-html="item.menuItemName"></v-list-item-title>
            <v-list-item-subtitle v-html="item.menuItemDescription"></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action class="ml-0 mt-0">
            <v-btn icon @click="removeFav(item.menuItemId)">
              <v-icon color="primary">mdi-heart</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-divider divider class="ml-3" width="93%"></v-divider>
      </v-list>
    </template>
    <div v-if="isLoading" style="display: flex; align-items: center; justify-content: center; margin-top: 10px">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    
    <NavBar></NavBar>
  </v-container>

</template>

<script>
import NavBar from '@/components/layout/NavBar';
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'

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
      isLoading: false,
    }
  },
  async mounted() {
    var length = await this.customerInfo.favourites.length;
    if (length == undefined) {
      this.isLoading = !this.isLoading;
      var response = await this.customerInfo.favourites;
      if (response)
        this.isLoading = !this.isLoading;
    }
  },
  methods: {
    goToMenuItem(menuItemId) {
      this.$router.push("/menuItem/" + menuItemId);
    },
    removeFav(menuItemId) {
      let data = {
        menuItemId: menuItemId
      }
      this.removeFavourite(data)
    },
    ...mapActions({
      removeFavourite: 'CustomerStore/removeFavourite',
    }),
  },
  computed: {
    ...mapGetters({
      customerInfo: 'CustomerStore/getCustomerProfile',
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