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
      <v-list v-for="(restaurantName, index) in restaurantFilteredList" :key="index" class="py-0">
        <v-subheader v-once style="height: 20px" class="mt-3 mb-1 pl-1">{{ restaurantName }}</v-subheader>
        <v-list v-for="item in filteredList(restaurantName)" :key="item.menuItemName" class="py-0">
          <v-list-item class="py-1 pr-0">
            <v-list-item-avatar @click="goToMenuItem(item.menuItemId)" tile  style="border-radius: 4px" size="45" >
              <v-img v-if="item.images.length !=  0" :src="item.images[0]"/>
              <v-img v-else src="../../assets/menuItemImages/item-placeholder.png"/>
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
      </v-list>
    </template>
    <div class="subtitle-1 mt-2 ml-2 grey--text lighten-3--text" v-if='customerInfo.favourites.length === 0'>
      You don't have any favourites.
    </div>
    <div v-if="isLoading" style="display: flex; align-items: center; justify-content: center; margin-top: 10px">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <v-btn v-if="checkedIn()" @click="goToCart" fixed app color="primary" width="52px" height="52px" elevation="1" absolute dark bottom style="right: 50%; transform: translateX(50%); bottom: 30px; z-index: 100;" fab>
      <v-icon>mdi-cart-outline</v-icon>
    </v-btn>
    <NavBar></NavBar>
  </v-container>

</template>

<script>
import NavBar from '@/components/layout/NavBar';
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'
import $ from 'jquery';

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
    filteredList(restaurantName) {
      var list =  this.customerInfo.favourites.filter(favourite => {
        return favourite.restaurantName === restaurantName && favourite.menuItemName.toLowerCase().includes(this.search.toLowerCase())
      })

      return list
    },
    goToCart() {
      this.$router.push('/cart')
    },
    checkedIn() {
      let checkedInVal = this.checkedInQRCode;
      let checkedInRestaurantId = this.checkedInRestaurantId;

      if (checkedInVal != null && checkedInRestaurantId != null) {
        return true;
      } else {
        return false;
      }
    },
  },
  computed: {
    ...mapGetters({
      customerInfo: 'CustomerStore/getCustomerProfile',
      checkedInQRCode: 'CustomerStore/getCheckedInQRCode',
      checkedInRestaurantId: 'CustomerStore/getCheckedInRestaurantId',
    }),
    restaurantFilteredList() {
      var list = [];

      for (let i = 0; i < this.customerInfo.favourites.length; i++) {
        list.push(this.customerInfo.favourites[i].restaurantName)
      }

      var uniqueRestaurants = [];
      $.each(list, function(i, el){
        if($.inArray(el, uniqueRestaurants) === -1) uniqueRestaurants.push(el);
      });

      return uniqueRestaurants
    },
    
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