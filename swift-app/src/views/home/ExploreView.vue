<template>
  <v-container class="px-0">
    <div v-show="isLoading" style="display: flex; align-items: center; justify-content: center;">
      <v-progress-circular style="height: 400px" indeterminate color="primary"></v-progress-circular>
    </div>
    <v-container v-show="!isLoading" py-0>
      <v-card flat tile>
        <v-row class="d-flex justify-space-between">
          <v-col cols="8">
            <div class="pl-1 welcome font-weight-light">Welcome, </div>
            <div class="pl-1 pt-0 customerName">{{customerInfo.name}} {{customerInfo.surname}}</div>
          </v-col>
          <v-col cols="4" class="d-flex justify-end align-center">
            <v-btn class="mr-4" elevation="2" width="35px" height="35px" @click="callWaiter" :key="activeCall.icon" :color="activeCall.color" small fab>
              <v-icon size="23px" :style="called ? { 'transform': 'rotate(45deg)' } : { 'transform': 'rotate(0deg)' }">{{ activeCall.icon }}</v-icon>
            </v-btn>
            <v-btn v-if="checkedIn()" @click="goToCart" elevation="2" width="35px" height="35px" small fab>
              <v-icon size="23px">mdi-cart-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-card v-show="checkedIn()" @click="goToRestaurant(checkedInRestaurantId)" color="accent" height="80px" flat tile style="border-radius: 13px !important" class="mt-2 mb-5">
          <v-row class="d-flex justify-space-between specialsInfo">
            <v-col cols="10" class="d-flex justify-center px-0">
              <div style="text-align: center" class="checkedInBannerText">
                <div class="specialsText font-weight-light">You are checked-in to</div>
                <div class="specialsText checkedRestaurant font-weight-light">{{getCheckedInRestaurantName(checkedInRestaurantId)}}</div>
              </div>
            </v-col>
            <v-col cols="2" class="d-flex align-center px-0">
              <v-btn small icon color="white">
                <v-icon size="32px">mdi-chevron-right</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <v-row no-gutters d-flex flex-row >
          <v-col cols="11">
            <v-text-field class="searchBarBg" background-color="red" v-model="search" rounded clearable solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search by name or category"></v-text-field>
          </v-col>
          <v-col cols="1" class="d-flex align-center px-0">
            <v-btn small icon color="primary">
              <v-icon size="24px">mdi-filter-variant</v-icon> 
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
    <v-container v-show="!isLoading" class="px-0 py-0" v-if="search == ''">
      <v-container py-0>
        <v-carousel v-model="carouselIndex" class="promotionalMaterial" :continuous="true" :cycle="cycle" :show-arrows="false" hide-delimiter-background :delimiter-icon="carouselTab" height="210px">
          <v-carousel-item v-for="(promotion, i) in promotions" :key="i">
            <v-sheet color="secondary" height="190px" flat tile style="border-radius: 13px !important" class="mt-5">
              <v-row class="d-flex justify-space-between specialsInfo">
                <v-col cols="6" class="pr-0 py-1 mb-5">
                  <v-layout column justify-space-around align-center fill-height>
                    <div class="px-3">
                      <!-- <span class="specialsText font-weight-light">30%</span> <span class="specialsText discount font-weight-light">discount</span> <span class="specialsText font-weight-light">on all pizza slices</span> -->
                      <span class="specialsText font-weight-light">{{ promotion.promotionalMessage }}</span>
                      <div class="mt-1 specialsDate">{{ promotion.period }}</div>
                    </div>
                    <div class="browseButton">
                      <v-btn @click="goToRestaurant(promotion.restaurantId)" color="accent" height="35px" class="browseMenu">Browse Menu</v-btn>
                    </div>
                  </v-layout>
                </v-col>
                <v-col cols="6" class="py-0">
                  <v-layout column fill-height>
                    <v-img :src="promotion.promotionalImage" class="specialsImage">{{ promotion.restaurant }}</v-img>
                  </v-layout>
                </v-col>
              </v-row>
            </v-sheet>
          </v-carousel-item>
        </v-carousel>
      </v-container>

      <v-container v-show="!isLoading" py-0 transition="slide-x-transition">
        <v-row style="max-width: 400px" class="overflow-y-auto">
          <v-col cols="12">
            <div class="categoryTitle">Categories</div>
          </v-col>
        </v-row>
        <v-sheet class="mx-auto" max-width="700">
          <v-slide-group multiple>
            <v-slide-item v-for="(category, index) in exploreCategories" :key="index">
              <div class="mr-3" align="center">
                <v-btn width="50px" height="50px" min-width="50px">
                  <v-img height="50px" width="50px" :src="category.categoryImage"></v-img>
                </v-btn>
                <div class="mt-1 caption">{{category.categoryName}}</div>
              </div>
            </v-slide-item>
          </v-slide-group>
        </v-sheet>


        <v-row style="max-width: 400px" class="overflow-y-auto">
          <v-col cols="12">
            <div class="categoryTitle">Most Popular</div>
          </v-col>
        </v-row>
        <v-sheet class="mx-auto" max-width="700">
          <v-slide-group multiple>
            <v-slide-item v-for="(card, index) in filteredList" :key="index">
              <v-card ripple flat width="140px" class="mr-4">
                <v-img :src="card.image" @click="goToRestaurant(card.restaurantId)" class="white--text align-center restaurantImage" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="90px" >
                  <v-rating background-color="white" readonly size="10" dense color="yellow darken-3" :value="parseInt(card.rating)" style="bottom: 3px; right: 3px; position: absolute"></v-rating>
                </v-img>
                <div class="pl-1 pt-1 resaturantTitle font-weight-light">{{card.name}}</div>
                <v-row class="ml-0">
                  <v-icon size="13px">mdi-map-marker</v-icon>
                  <div class="pl-0 pt-0 restaurantLocation font-weight-light">{{card.branch}}</div>
                </v-row>
                <div class="ml-1 pt-0 restaurantCategory">{{getCategoryNames(card.categories)}}</div>
                <v-row class="pl-3 mt-1">
                  <v-col v-for="(tag, i) in descriptors" :key="i" class="pl-0 pr-3 pt-0">
                    <div class="restaurantDescriptor">{{tag}}</div>
                  </v-col>
                </v-row>
              </v-card>
            </v-slide-item>
          </v-slide-group>
        </v-sheet>
      </v-container>

      <v-container v-show="!isLoading" pt-0>
        <v-card color="primary" height="140px" flat tile style="border-radius: 13px !important" class="mt-5">
          <v-row class="px-0 py-0 specialsInfo">
            <v-col cols="6" class="pl-7 py-3 pr-0">
              <v-layout column justify-space-between fill-height>
                <div class="headingText">Big Promotion</div>
                <div>
                  <div class="promotionalText">Only</div>
                  <div class="priceText">R60.00</div>
                  <div class="promotionalText">2 Pizzas (Wed-Fri)</div>
                </div>
              </v-layout>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-layout column fill-height>
                <v-img src="../../assets/exploreImages/colcacchio.jpg" class="specialsImage bannerImage pl-2">Pizza Hut</v-img>
              </v-layout>
            </v-col>
          </v-row>
        </v-card>

        <v-btn v-if="!checkedIn()" height="50px" width="50px" class="checkInBtn" @click=goToCheckin app color="primary" fab style="position: fixed; bottom: 65px; right: 13px">
          <v-icon size="30">mdi-table-furniture</v-icon>
        </v-btn>
      </v-container>
    </v-container>
      
    <v-container v-show="!isLoading" v-else class="mt-3">
      <div v-if="filteredList.length != 0">
        <v-card @click="goToRestaurant(card.restaurantId)" elevation="2" v-for="(card, index) in filteredList" :key="index">
          <v-row class="mx-0">
            <v-col cols="3" class="py-2 px-1 pl-2">
              <v-img width="75px" height="70px" style="background-size: contain" :src="card.image" class="align-center mt-3"></v-img>
            </v-col>
            <v-col cols="9" class="py-2">
              <v-row class="py-0">
                <v-col cols="8" class="pt-0 pl-2 pb-1">
                  <div class="pl-1 pt-1 resaturantTitle font-weight-light">{{card.name}}</div>
                  <div class="ml-1 pt-0 restaurantCategory">{{getCategoryNames(card.categories)}}</div>
                </v-col>
                <v-col cols="4" class="pt-0 px-2 pb-1">
                  <v-rating background-color="secondary" readonly size="11" dense color="yellow darken-3" :value="parseInt(card.rating)"></v-rating>
                </v-col>
              </v-row>
              <v-row class="px-2">
                <v-col cols="8" class="px-1 pt-0">
                  <div class="px-1 mr-2 pt-0 restaurantDescriptor" v-for="(tag, i) in descriptors" :key="i" style="display: inline">{{tag}}</div>
                </v-col>
                <v-col cols="4" class="px-0 pt-0" style="text-align: right">
                  <v-icon size="13px">mdi-map-marker</v-icon>
                  <div class="pl-1 py-0 restaurantLocation font-weight-light" style="display: inline">Brooklyn</div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </div>
      <div v-else class="pl-1 py-0 restaurantLocation font-weight-light" style="display: inline; font-size: 15px">No search results...</div>
    </v-container>  
    <NavBar></NavBar>
  </v-container>
</template>

<script>
import NavBar from '@/components/layout/NavBar';
import RestaurantSearchToolBar from '@/components/layout/RestaurantSearchToolBar';
import store from '@/store/store.js';
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    'NavBar': NavBar,
    'RestaurantSearchToolBar': RestaurantSearchToolBar
  },
  data: () => ({
    search: '',
    promotions: [
      {restaurantId: 1, restaurant: "Col'Cacchio", promotionalMessage: "30% discount on all pizza's ordered", period: "Monday 18:00-22:00", promotionalImage: "https://source.unsplash.com/MQUqbmszGGM/800x800"},
      {restaurantId: 2, restaurant: "Aroma", promotionalMessage: "Free ice cream for each cappuccino bought", period: "Thursday 12:00-18:00", promotionalImage: "https://source.unsplash.com/VZ9zJ9wk2AE/800x800"},
      {restaurantId: 3, restaurant: "Burger Bistro", promotionalMessage: "Burger competition", period: "31 July - 08 August", promotionalImage: "https://source.unsplash.com/sc5sTPMrVfk/800x800"}
    ],
    categories: [
      { imageURL: 'drinks.jpg', name: 'Drinks' },
      { imageURL: 'pizza.jpg', name: 'Pizza' },
      { imageURL: 'burger.jpg', name: 'Burgers' },
      { imageURL: 'fastFood.jpg', name: 'Fast Food' },
      { imageURL: 'dessert.jpg', name: 'Desserts' },
      { imageURL: 'seafood.jpg', name: 'Seafood' },
      { imageURL: 'asian.jpg', name: 'Asian' },
      { imageURL: 'healthy.jpg', name: 'Healthy' },
      { imageURL: 'breakfast.jpg', name: 'Breakfast' },
      { imageURL: 'cafe.jpg', name: 'Cafe' },
    ],
    // category: ["Western Cuisine", "Fast Food", "Breakfast"],
    descriptors: ["Fast Service", "Presentation"],
    favourited: false,
    called: false,
    // checkedIn: false,
    restaurant: "Mugg & Bean",
    cycle: true,
    isLoading: false,
    carouselIndex: 0
  }),
  methods: {
    async goToRestaurant (id) {
      await this.clearMenu;
      this.$store.dispatch('RestaurantsStore/retrieveRestaurantMenu', id);
      this.$router.push("/menu/" + id);
    },
    goToCheckin () {
      this.$router.push('/checkin')
    },
    changeFavouriteFab () {
      this.favourited = !this.favourited
    },
    callWaiter() {
      this.called = !this.called;
    },
    goToCart() {
      this.$router.push('/cart')
    },
    getCheckedInRestaurantName(id) {
      if (this.allRestaurants != undefined && id != null) {
        let item = this.allRestaurants.find(
          restaurant => restaurant.restaurantId === id
        )
        return item.name;
      }
    },
    getCategoryNames(categories) {
      if (categories.length != 0 ) {
        var list = [];
        for (let i = 0; i < categories.length; i++) { 
          list.push(this.exploreCategories.find((category) => {
            return category.categoryId === categories[i]
          }).categoryName)
        }

        return list.join(', ')
      }
    },
    checkedIn() {
      let checkedInVal = this.checkedInQRCode;
      let checkedInRestaurantId = this.checkedInRestaurantId;

      if (checkedInVal != null && checkedInRestaurantId != null) {
        return true;
      } else {
        return false;
      }
    }
  },
  ...mapActions({
    checkInCustomer: 'CustomerStore/checkInCustomer',
  }),
  async mounted() {
    let checkedInVal = await this.checkedInQRCode;
    // Check-in customer again if system crashes 
    if (checkedInVal != null && this.checkedInRestaurantId == null) {
      this.isLoading = true;
      var data = {
        "qrcode": checkedInVal
      }

      await this.$store.dispatch('CustomerStore/checkInCustomer', data);
    } 

    var length = await this.allRestaurants.length;
    var categoryLength = await this.exploreCategories.length;

    if (length == undefined && categoryLength == undefined) {
      this.isLoading = true;
      var retrievedAllRestaurants = await this.fetchAllRestaurants;
      var retrievedExploreCategories = await this.retrieveExploreCategories;
      
      if (retrievedAllRestaurants && retrievedExploreCategories)
        this.isLoading = false;
    }
    
    
  },
  computed: {
    activeCall() {
      if (!this.called) {
        return { color: "secondary", icon: "mdi-bell-outline" };
      } else {
        return { color: "primary", icon: "mdi-bell-outline" };
      }
    },
    filteredList() {
      if (this.allRestaurants.length != undefined)
        return this.allRestaurants.filter(restaurant => {
          return restaurant.name.toLowerCase().includes(this.search.toLowerCase())
        })
    },
    carouselTab () {
      return 'mdi-checkbox-blank-circle';
    },
    ...mapActions({
      fetchAllRestaurants: 'RestaurantsStore/allRestaurants',
      checkInCustomer: 'CustomerStore/checkInCustomer',
      retrieveExploreCategories: 'RestaurantsStore/retrieveExploreCategories',
    }),
    ...mapMutations({
      clearMenu: 'MenuStore/CLEAR_MENU',
    }),
    ...mapGetters({
      allRestaurants: 'RestaurantsStore/getAllRestaurants',
      exploreCategories: 'RestaurantsStore/getExploreCategories',
      customerInfo: 'CustomerStore/getCustomerProfile',
      // checkedInStatus: 'CustomerStore/getCheckedInStatus',
      checkedInQRCode: 'CustomerStore/getCheckedInQRCode',
      checkedInRestaurantId: 'CustomerStore/getCheckedInRestaurantId',
    }),
  },
}
</script>

<style>

 body {
   font-family: 'Helvetica';
 }

 .searchBarBg label {
   font-size: 15px;
 }

  .searchBarBg.v-text-field.v-text-field--solo .v-input__control {
    min-height: 48px !important;
    max-width: 97%  !important;
  }

  .promotionalMaterial .v-carousel__controls__item {
    margin: 0px !important;
    padding-top: 5px;
  }

  .promotionalMaterial .v-btn .v-btn__content .v-icon {
    font-size: 9px !important;
    margin: 0px !important;
    color: white;
    opacity: 1;
  }

  .promotionalMaterial .v-btn--icon.v-size--small {
    height: 14px;
    width: 18px;
  }

  .promotionalMaterial .v-item--active .v-btn__content .v-icon {
    color: #f75564 !important;
  }

  .welcome {
    font-size: 25px;
  }

  .customerName {
    font-size: 23px;
  }

  .specialsText {
    font-size: 18px;
    color: white;
  }

  .checkedRestaurant {
    font-size: 20px;
  }

  .specialsDate {
    font-size: 12px;
    color: white;
  }

  .browseMenu {
    font-size: 14px;
    border-radius: 7px;
  }

  .discount {
    color: #f75564;
  }

  .specialsImage {
    /* background: url("../../assets/exploreImages/colcacchio.jpg") no-repeat;
    background-size: cover; */
    /* height: 100%; */
    /* width: 103.5%; */
    border-top-right-radius: 7px;
    border-bottom-right-radius: 7px;
    color: white !important;
    font-size: 24px;
    text-align: center;
    line-height: 180px;
  }

  .bannerImage {
    line-height: 140px;
    font-size: 22px;
    border-bottom-left-radius: 130px;
  }

  .specialsInfo {
    height: 100%;
  }

  .categoryTitle {
    font-size: 16px;
    font-weight: 500;
  }

  .restaurantImage {
    border-radius: 7px !important;
  }

  .resaturantTitle {
    font-size: 17px;
  }

  .restaurantLocation {
    font-size: 11px;
  }

  .restaurantCategory {
    font-size: 12px;
    height: 36px;
  }

  .restaurantDescriptor {
    border-radius: 12px;
    background-color: lightgray;
    opacity: 0.6;
    font-weight: 500;
    font-size: 10px;
    text-align: center;
  }

  .headingText{
    color: white;
    font-size: 19px;
  }

  .promotionalText{
    color: white;
    font-size: 13px;
  }

  .priceText {
    color: #f9a825;
    font-size: 21px;
  }

  .checkedInBannerText {
    padding-left: 17%;
  }

  .promotionalMaterial .v-image .v-responsive .v-carousel__item {
    height: 0px
  }
</style>