<template>
  <v-container class="pa-0 ma-0">
    <div style="position: absolute; z-index: 100; right: 80px; top: 15px;">
      <v-btn class="mr-3" v-show="!isLoading" v-if="checkedIn()" @click="goToCart" app color="primary" width="35px" height="35px" dark  elevation="1"  fab>
        <v-icon>mdi-cart-outline</v-icon>
      </v-btn>
      <v-btn v-show="!isLoading" v-if="checkedIn()" @click="goToRestaurant(checkedInRestaurantId)" app color="accent" width="35px" height="35px" dark  elevation="1"  fab>
        <v-icon>mdi-storefront-outline</v-icon>
      </v-btn>
    </div>
    <DesktopNavbar v-show="!isLoading"></DesktopNavbar>
    <v-container style="padding-left: 70px; padding-right: 70px;">
      <div v-show="isLoading" style="display: flex; align-items: center; justify-content: center;">
        <v-progress-circular style="height: 400px" indeterminate color="primary"></v-progress-circular>
      </div>
      <v-container v-show="!isLoading" py-0>
        <v-card flat tile>
          <v-row class="d-flex justify-space-between">
            <v-col cols="8">
              <span class="pl-1 welcome font-weight-light">Welcome, </span>
              <span class="pl-1 pt-0 customerName">{{customerInfo.name}} {{customerInfo.surname}}</span>
            </v-col>
            <v-col cols="4" class="d-flex justify-end align-center">
              <v-text-field class="searchBarBg" background-color="red" v-model="search" rounded solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search for a restaurant..."></v-text-field>
              <!-- <v-btn v-if="checkedIn()" @click="goToCart" elevation="2" width="35px" height="35px" small fab>
                <v-icon size="23px">mdi-cart-outline</v-icon>
              </v-btn> -->
            </v-col>
            <v-col cols="1" >
              
            </v-col>
          </v-row>
        </v-card>
      </v-container>
      <v-container v-show="!isLoading" class="px-0 py-0" v-if="search == ''">
        <v-container py-0>
          <v-row class="d-flex justify-center">
            <v-col cols="6" class="py-0">
              <v-carousel v-model="carouselIndex" class="promotionalMaterial" :continuous="true" :cycle="true" :show-arrows="false" hide-delimiter-background :delimiter-icon="carouselTab" height="180px">
                <v-carousel-item v-for="(promotion, i) in activePromotions.restaurantPromo" :key="i">
                  <v-sheet @click="goToRestaurant(promotion.restaurantId)" :color="(i == 3) ? 'primary' : 'secondary'" height="150px" flat tile style="border-radius: 10px !important" class="mt-5">
                    <v-row class="d-flex justify-space-between px-0 py-0">
                      <v-col cols="6" class="p-3 pr-0">
                        <v-layout column justify-space-between fill-height>
                          <div class="px-3">
                            <!-- <span class="specialsText font-weight-light">30%</span> <span class="specialsText discount font-weight-light">discount</span> <span class="specialsText font-weight-light">on all pizza slices</span> -->
                            <span class="specialsText font-weight-light">{{ promotion.message }}</span>
                            <div class="mt-1 specialsDate">{{ getDate(promotion.startDate) }} until {{ getDate(promotion.endDate) }}</div>
                          </div>
                          <!-- <div class="browseButton">
                            <v-btn @click="goToRestaurant(promotion.restaurantId)" color="accent" height="33px" class="browseMenu px-2">Browse Menu</v-btn>
                          </div> -->
                        </v-layout>
                      </v-col>
                      <v-col cols="6" class="py-0" style="height: 155px">
                        <v-layout column class="py-0 d-flex flex-column align-end">
                          <v-img height="150px" :src="promotion.image" :class="(i == 3) ? 'specialsImage bannerImage pl-2' : 'specialsImage'"></v-img>
                          <span class="specialsRestaurantName" style="top: 80px; right: 15px; position: absolute">{{ getCheckedInRestaurantName(promotion.restaurantId) }}</span>
                        </v-layout>
                      </v-col>
                    </v-row>
                  </v-sheet>
                </v-carousel-item>
              </v-carousel>
            </v-col>
          </v-row>
        </v-container>

        <v-container v-show="!isLoading" py-0 transition="slide-x-transition">
          <v-row style="max-width: 400px" class="overflow-y-auto">
            <v-col cols="12">
              <div class="categoryTitle">Categories</div>
            </v-col>
          </v-row>
          <div  style="display: flex; flex-direction; row;">
            <div v-for="(category, index) in exploreCategories" :key="index" class="mr-3" align="center">
              <v-btn color="primary" width="60px" height="60px" min-width="60px" class="categoryButtons"  @click="restCategories[index] = !restCategories[index]; toggleCategoryActive(index)">
                <v-img v-if="!restCategories[index]" height="60px" width="60px" :src="category.categoryImage"></v-img>
                <v-icon size="35px" v-else >{{category.categoryicon}}</v-icon>
              </v-btn>
              <div class="mt-1 caption">{{category.categoryName}}</div>
            </div>
          </div>


          <v-row style="max-width: 400px" class="overflow-y-auto" v-show="filteredList != undefined && filteredList.length != 0">
            <v-col cols="12">
              <div class="categoryTitle">Most Popular</div>
            </v-col>
          </v-row>
            <v-row v-show="filteredList != undefined">
              <v-col v-for="(card, index) in filteredList.slice(0, 12)" :key="index"  cols="3" style="display: flex; flex-direction; row;">
                <v-card ripple flat  class="mr-4">
                  <v-img :src="card.image" @click="goToRestaurant(card.restaurantId)" class="white--text align-center restaurantImage" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="250px" width="417px">
                    <v-rating background-color="white" readonly size="14" dense color="yellow darken-3" :value="parseInt(card.rating)" style="bottom: 3px; right: 3px; position: absolute"></v-rating>
                  </v-img>
                  <div class="pl-1 pt-1 resaturantTitle cardFormat font-weight-light">{{trimRestaurantName(card.name)}}</div>
                  <v-row class="ml-0">
                    <v-icon size="13px">mdi-map-marker</v-icon>
                    <div class="pl-0 pt-0 restaurantLocation font-weight-light">{{card.branch}}</div>
                  </v-row>
                  <div class="ml-1 pt-0 restaurantCategory">{{getCategoryNames(card.categories)}}</div>
                  <v-row class="pl-3 mt-1">
                    <v-col cols="auto" v-for="(tag, i) in card.phrases" :key="i" class="pl-0 pr-3 pt-0">
                      <div class="restaurantDescriptor">{{tag}}</div>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
            
          <v-row style="max-width: 400px" class="overflow-y-auto">
            <v-col cols="12">
              <div class="categoryTitle">Based On Your Ratings</div>
            </v-col>
          </v-row>
          <v-sheet class="mx-auto">
            <v-slide-group multiple>
              <v-slide-item v-for="(item, index) in suggestedItemsFromRatings" :key="index">
                <v-card ripple flat width="200px" class="mr-4">
                  <v-img v-if="item.menuItemInfo.images.length != 0" :src="item.menuItemInfo.images[0].imageurl" @click="goToRestaurant(item.menuItemInfo.restaurantid)" class="white--text align-center restaurantImage" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="125px" >
                  </v-img>
                  <v-img v-else src="../../assets/menuItemImages/item-placeholder.png" @click="goToRestaurant(item.menuItemInfo.restaurantid)" class="white--text align-center restaurantImage" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="125px" >
                  </v-img>
                  <div class="pl-1 pt-1 resaturantTitle cardFormat font-weight-light">{{item.menuItemInfo.menuitemname}}</div>
                  <span class="pl-1 subtitle-1">R{{ (item.menuItemInfo.price).toFixed(2) }}</span>
                </v-card>
              </v-slide-item>
            </v-slide-group>
          </v-sheet>
        </v-container>

        <v-container v-show="!isLoading && (filteredList != undefined && filteredList.length != 0)" class="mt-0 pt-0">
          <div class="categoryTitle mb-2">More Restaurants</div>
          <v-row>
            <v-col v-for="(card, index) in filteredList" :key="index" class="d-flex flex-row" cols="3">
              <v-card  ripple flat  class="mb-1">
                <v-img :src="card.image" @click="goToRestaurant(card.restaurantId)" class="white--text align-center restaurantImage" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="250px" width="417px">
                  <v-rating background-color="white" readonly size="14" dense color="yellow darken-3" :value="parseInt(card.rating)" style="bottom: 3px; right: 3px; position: absolute"></v-rating>
                </v-img>
                <v-row class="d-flex flex-row ">
                  <v-col cols="7" class="pt-0">
                    <div class="pl-1 pt-1 resaturantTitle cardFormat font-weight-light">{{trimRestaurantName(card.name)}}</div>
                    <v-row class="ml-0">
                      <v-icon size="13px">mdi-map-marker</v-icon>
                      <div class="pl-0 pt-0 restaurantLocation font-weight-light">{{card.branch}}</div>
                    </v-row>
                  </v-col>
                  <v-col cols="5" class="pt-0">
                    <v-row class="pl-0 mt-1">
                      <v-col cols="12" class="pa-0 pb-1">
                        <div class="ml-1 mr-2 pt-1 restaurantCategory">{{getCategoryNames(card.categories)}}</div>
                      </v-col>
                      <v-col cols="auto" v-for="(tag, i) in card.phrases" :key="i" class="pl-0 pt-1 pr-1">
                        <div class="restaurantDescriptor">{{tag}}</div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        

          <v-btn v-if="!checkedIn()" height="50px" width="50px" class="checkInBtn" @click=goToCheckin app color="primary" fab style="position: fixed; bottom: 65px; right: 13px">
            <v-icon size="30">mdi-table-furniture</v-icon>
          </v-btn>
      </v-container>
        
      <v-container v-show="!isLoading" v-else class="mt-3">
        <div v-if="filteredList != undefined">
          <v-row style="display: flex; flex-direction; row;">
            <v-col cols="4" v-for="(card, index) in filteredList" :key="index">
              <v-card class="mb-2" @click="goToRestaurant(card.restaurantId)" elevation="2"  >
                <v-row class="mx-0">
                  <v-col cols="3" class="py-0 px-1 pl-2">
                    <v-img width="75px" height="70px" style="background-size: contain" :src="card.image" class="align-center mt-3"></v-img>
                  </v-col>
                  <v-col cols="9" class="pt-2 py-0">
                    <v-row class="py-0">
                      <v-col cols="8" class="pt-0 pl-2 pb-1">
                        <div class="pl-1 pt-1 resaturantTitle font-weight-light">{{trimCardRestaurantName(card.name)}}</div>
                        <div class="ml-1 pt-0 restaurantCategory">{{getCategoryNames(card.categories)}}</div>
                      </v-col>
                      <v-col cols="4" class="pt-0 px-2 pb-1">
                        <v-rating background-color="secondary" readonly size="11" dense color="yellow darken-3" :value="parseInt(card.rating)"></v-rating>
                      </v-col>
                    </v-row>
                    <v-row class="px-2">
                      <v-col class="px-1 pt-0">
                        <div class="px-1 mr-1 pt-0 restaurantDescriptor" v-for="(tag, i) in card.phrases" :key="i" style="display: inline">{{tag}}</div>
                      </v-col>
                      <v-col cols="auto" class="px-0 pt-0" style="text-align: right">
                        <v-icon size="13px">mdi-map-marker</v-icon>
                        <div class="pl-1 py-0 restaurantLocation font-weight-light" style="display: inline">{{card.branch}}</div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
          
        </div>
        <div v-else class="pl-1 py-0 restaurantLocation font-weight-light" style="display: inline; font-size: 15px">No search results...</div>
      </v-container> 
    </v-container>
    
    
  </v-container>
</template>

<script>
import DesktopNavbar from '@/components/layout/DesktopNavbar';
import RestaurantSearchToolBar from '@/components/layout/RestaurantSearchToolBar';
import store from '@/store/store.js';
import { mapActions, mapGetters, mapMutations } from 'vuex'
import $ from 'jquery'
import moment from 'moment'

export default {
  name: 'DesktopExplore',
  components: {
    'DesktopNavbar': DesktopNavbar,
    'RestaurantSearchToolBar': RestaurantSearchToolBar,
  },
  data: () => ({
    search: '',
    promotions: [
      {restaurantId: 1, restaurant: "Col'Cacchio", promotionalMessage: "30% discount on all pizzas ordered", period: "Monday 18:00-22:00", promotionalImage: "https://source.unsplash.com/MQUqbmszGGM/800x800"},
      {restaurantId: 2, restaurant: "Aroma", promotionalMessage: "Free ice cream for each cappuccino bought", period: "Thursday 12:00-18:00", promotionalImage: "https://source.unsplash.com/VZ9zJ9wk2AE/800x800"},
      {restaurantId: 3, restaurant: "Burger Bistro", promotionalMessage: "Burger competition", period: "31 July - 08 August", promotionalImage: "https://source.unsplash.com/sc5sTPMrVfk/800x800"},
      {restaurantId: 4, restaurant: "Pizza Hut", promotionalMessage: 'Big Promotion: \n2 Pizzas only R60.00', period: "(Wed - Fri)", promotionalImage: "https://source.unsplash.com/MQUqbmszGGM/800x800"}
    ],
    favourited: false,
    called: false,
    selectedCategories: [],
    restCategories: [],
    cycle: true,
    isLoading: false,
    carouselIndex: 0,
    isMobile: false,
  }),
  methods: {
    async goToRestaurant (id) {
      if (this.menu.id != id) {
        await this.clearMenu
        this.$store.dispatch('RestaurantsStore/retrieveRestaurantMenu', id);
      }
      
      this.$router.push("/menu/" + id);
    },
    goToCheckin () {
      this.$router.push('/checkin')
    },
    changeFavouriteFab () {
      this.favourited = !this.favourited
    },
    getNotifications() {
      // this.called = !this.called;
    },
    toggleCategoryActive(i) {
      let categoryId = this.exploreCategories[i].categoryId;
      const index = this.selectedCategories.indexOf(categoryId);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      } else {
        this.selectedCategories.push(categoryId)
      }
    },
    getDate(date) {
      return moment(String(date.slice(0, 10))).format('DD MMM')
    },
    goToCart() {
      this.$router.push('/cart')
    },
    getCheckedInRestaurantName(id) {
      if (this.allRestaurants.length != undefined && id != null) {
        let item = this.allRestaurants.find(
          restaurant => restaurant.restaurantId === id
        )
        return item.name;
      }
    },
    trimRestaurantName(name) {
      var maxLength = 22;
      if (name.length > maxLength) {
        var trimmed = name.substr(0, maxLength);
        trimmed = trimmed.substr(0, Math.min(trimmed.length, trimmed.lastIndexOf(" ")));
        return trimmed;
      }
      return name;
    },
    trimCardRestaurantName(name) {
      var maxLength = 18;
      if (name.length > maxLength) {
        var trimmed = name.substr(0, maxLength);
        trimmed = trimmed.substr(0, Math.min(trimmed.length, trimmed.lastIndexOf(" ")));
        return trimmed;
      }
      return name;
    },
    getCategoryNames(categories) {
      if (categories.length != 0 ) {
        var list = [];
        if (Array.isArray(this.exploreCategories))
          for (let i = 0; i < categories.length && i < 3; i++) { 
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
    },
    containsCategories(arr1, arr2){
      if (arr2 != undefined)
        return arr2.every(el => arr1.includes(el));
      return true;
    },
    onResize () { 
      this.isMobile = $(window).width() < 600
    },
    promotionDays(days) {
      var list = [];
      let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let consecutive = true;
      if (days.length != 7) {
        for (let i = 1; i < days.length; i++) {
          if (weekdays.indexOf(days[i]) != weekdays.indexOf(days[i-1]) + 1) {
            consecutive = false;
            break;
          }
        }
        if (!consecutive) {
          days.forEach(element => list.push(element.substring(0,3)) );
        } else {
          return days[0].substring(0,3) + " - " + (days[days.length-1]).substring(0,3)
        }
      }
      
      return list.join(', ');
    },
  },
  ...mapActions({
    checkInCustomer: 'CustomerStore/checkInCustomer',
  }),
  async mounted() {
    this.onResize() 
    window.addEventListener('resize', this.onResize, { passive: true })

    this.clearItem;
    if (this.customerInfo.theme === 'light') {
      this.$vuetify.theme.dark = false;
    } else if (this.customerInfo.theme === 'dark') {
      this.$vuetify.theme.dark = true;
    }

    // var length = await this.allRestaurants.length;
    // var categoryLength = await this.exploreCategories.length;

    if (!Array.isArray(this.allRestaurants)) {
      this.isLoading = true;
      var retrievedAllRestaurants = await this.fetchAllRestaurants;
      var retrievedExploreCategories = await this.retrieveExploreCategories;
      // Change this to have the checked-in menu be its own object
      var menuItemsList = await this.$store.dispatch('RestaurantsStore/retrieveSuggestedMenuItemIds');
      if (menuItemsList) 
        await this.$store.dispatch('RestaurantsStore/retrieveSuggestedMenuItemsFromRatings', menuItemsList);
      let promos = await this.$store.dispatch('RestaurantsStore/retrieveActivePromotions');
      if (this.checkedInRestaurantId) {
        if (Object.keys(promos).length != 0 && promos.restaurantPromo.length > 0){
          await this.$store.dispatch('RestaurantsStore/fetchActiveCheckedInPromo', promos);
        }
        await this.$store.dispatch('MenuStore/retrieveMenu', this.checkedInRestaurantId);
      }
      
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
      if (Array.isArray(this.allRestaurants)) {
        var items = [];
        items = this.allRestaurants.filter(restaurant => 
          this.containsCategories(restaurant.categories, this.selectedCategories) && restaurant.name.toLowerCase().includes(this.search.toLowerCase())
        )

        if (items.length != 0) {
          // console.log(items)
          return items.slice().sort(function(a, b) {
            return b.rating - a.rating;
          });
        }

        
      }
    },
    carouselTab () {
      return 'mdi-checkbox-blank-circle';
    },
    ...mapActions({
      fetchAllRestaurants: 'RestaurantsStore/allRestaurants',
      checkInCustomer: 'CustomerStore/checkInCustomer',
      retrieveExploreCategories: 'RestaurantsStore/retrieveExploreCategories',
      clearItem: "MenuItemsStore/clearItem",
    }),
    ...mapMutations({
      clearMenu: 'MenuStore/CLEAR_MENU',
    }),
    ...mapGetters({
      allRestaurants: 'RestaurantsStore/getAllRestaurants',
      exploreCategories: 'RestaurantsStore/getExploreCategories',
      customerInfo: 'CustomerStore/getCustomerProfile',
      checkedInQRCode: 'CustomerStore/getCheckedInQRCode',
      checkedInRestaurantId: 'CustomerStore/getCheckedInRestaurantId',
      suggestedItemsIds: 'RestaurantsStore/getSuggestedItemsIds',
      suggestedItemsFromRatings: 'RestaurantsStore/getSuggestedItemsFromRatings',
      activePromotions: 'RestaurantsStore/getAllActiveRestaurantPromotions',
      menu: "MenuStore/getMenu",
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
    font-size: 14px;
    color: white;
    white-space: pre-wrap;
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
    opacity: 0.85;
    border-top-right-radius: 7px;
    border-bottom-right-radius: 7px;
    /* color: white !important; */
    
    line-height: 50px;
  }

  .specialsRestaurantName {
    font-size: 18px;
    text-align: center;
  }

  /* .activeButtonClass {
    border: 2px rgba(247, 85, 100, 0.7) solid;
  } */

  .bannerImage {
    /* line-height: 150px; */
    /* font-size: 17px; */
    border-bottom-left-radius: 160px;
  }

  .specialsInfo {
    height: 100%;
  }

  .categoryTitle {
    font-size: 16.5px;
    font-weight: 500;
  }

  .restaurantImage {
    border-radius: 7px !important;
  }

  .resaturantTitle {
    font-size: 17px;
  }

  .restaurantLocation {
    font-size: 12px;
  }

  .restaurantCategory {
    font-size: 12px;
  }

  .restaurantDescriptor {
    border-radius: 7px;
    background-color: rgba(211,211,211, 0.5);
    font-weight: 400;
    font-size: 10.5px;
    text-align: center;
    padding-top: 1px;
    padding-bottom: 1px;
    padding-left: 8px;
    padding-right: 8px;
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

  .v-slide-group__wrapper {
    touch-action: auto !important;
  }
</style>