<template>
  <div class="homemenu">
    <div class="toolbar">
      <v-card color="grey lighten-4" flat tile>
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
    <v-container py-0 transition="slide-x-transition">
      <v-row style="max-width: 400px" class="overflow-y-auto">
        <v-col cols="12">
          <div class="title">Categories</div>
        </v-col>
      </v-row>
      <v-sheet class="mx-auto" max-width="700">
        <v-slide-group multiple>
          <v-slide-item v-for="(category, index) in categories" :key="index">
            <div class="ml-0" align="center">
              <v-btn width="50px" height="50px" min-width="50px" class="mx-2" >
                <!-- <v-avatar size="40px"> -->
                  <v-icon size="33px">{{ category.icon }}</v-icon>
                <!-- </v-avatar> -->
              </v-btn>
              <div class="mt-1 caption">{{category.name}}</div>
            </div>
          </v-slide-item>
        </v-slide-group>
      </v-sheet>
      <v-divider class="mt-2"></v-divider>
      

      <v-row style="max-width: 400px" class="overflow-y-auto">
        <v-col cols="12">
          <div class="title restaurants">Restaurants Near You</div>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col v-for="restaurant in allRestaurants" :key="restaurant.name" cols="6">
          <v-card ripple>
            <v-img @click="goToRestaurant(restaurant.restaurantId)" :src="restaurant.image" class="white--text align-center" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="120px">
              <!-- <v-card-title class="body-1 pa-2 pl-4" v-text="restaurant.name"></v-card-title>
              <v-card-text><v-rating :value="restaurant.rating" readonly size="18" dense color="yellow darken-3" background-color="secondary" ></v-rating></v-card-text> -->
            </v-img>
            <v-row class="pl-2">
              <v-card-title class="body-1 pb-0 pt-2" v-text="restaurant.name"></v-card-title>
              <v-card-text><v-rating :value="restaurant.rating" readonly size="15" dense color="yellow darken-3" background-color="secondary" ></v-rating></v-card-text>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <v-row  style="max-width: 400px" class="overflow-y-auto pl-1">
        <v-col cols="12">
          <div class="title">Popular Restaurants</div>
        </v-col>
      </v-row>

      <v-sheet class="mx-auto pl-0 pb-4" max-width="700">
        <v-slide-group multiple>
          <v-slide-item v-for="card in filteredList" :key="card.title">
            <v-card ripple width="170px" class="mr-2">
              <v-img :src="card.src" @click="goToMenuItem(1)" class="white--text align-center" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" width="170px" height="100px" >
                <!-- <v-card-title class="pl-2 pt-1 body-1" v-text="card.title"></v-card-title>
                <v-rating :value="card.rating" size="14" class="pl-2" dense color="yellow darken-3" background-color="secondary"></v-rating> -->
              </v-img>
              <v-row>
                <v-card-title class="body-1 pb-0 pt-2" v-text="card.title"></v-card-title>
                <v-card-text class="pb-2"><v-rating :value="card.rating" readonly size="15" dense color="yellow darken-3" background-color="secondary" ></v-rating></v-card-text>
              </v-row>
            </v-card>
          </v-slide-item>
        </v-slide-group>
      </v-sheet>

      <v-btn class="checkInBtn" @click=goToCheckin app color="accent" style="bottom: 20px; right: 20px;" absolute  fab  >
        <v-icon>mdi-table-furniture</v-icon>
      </v-btn>
    </v-container>
      
    <NavBar></NavBar>
  </div>
</template>

<script>
import NavBar from '@/components/layout/NavBar';
import RestaurantSearchToolBar from '@/components/layout/RestaurantSearchToolBar';
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    'NavBar': NavBar,
    'RestaurantSearchToolBar': RestaurantSearchToolBar
  },
  data: () => ({
    search: '',
    categories: [
      { icon: 'mdi-glass-cocktail', name: 'Drinks' },
      { icon: 'mdi-pizza', name: 'Pizza' },
      { icon: 'mdi-hamburger', name: 'Burgers' },
      { icon: 'mdi-fish', name: 'Seafood' },
      { icon: 'mdi-noodles', name: 'Asian' },
      { icon: 'mdi-apple', name: 'Healthy' },
      { icon: 'mdi-food', name: 'Fast Food' },
      { icon: 'mdi-cupcake', name: 'Desserts' },
      { icon: 'mdi-food-croissant', name: 'Bakery' },
      { icon: 'mdi-coffee', name: 'Cafe' },
    ],
    popularFood: [
      {
        title: "Crawdaddy's",
        rating: 4,
        src: "https://source.unsplash.com/800x800/?steakhouse"
      },
      {
        title: "Pizza e Vino",
        rating: 5,
        src: "https://source.unsplash.com/800x800/?pizza"
      },
      {
        title: "Cappuccinos",
        rating: 4,
        src: "https://source.unsplash.com/800x800/?pasta"
      },
      {
        title: "Ocean Basket",
        rating: 3,
        src: "https://source.unsplash.com/800x800/?seafood"
      }
    ],
    /* restaurants: [
      { title: 'Mugg & Bean', src: 'https://source.unsplash.com/800x800/?mcdonalds', flex: 4 },
      { title: 'RocoMamas', src: 'https://source.unsplash.com/800x800/?spaghetti', flex: 4 },
      { title: 'Burger King', src: 'https://source.unsplash.com/800x800/?burgerking', flex: 4 },
      { title: 'Varsity Bakery', src: 'https://source.unsplash.com/800x800/?bakery', flex: 4 },
      { title: 'Ocean Basket', src: 'https://source.unsplash.com/800x800/?burger', flex: 4 },
      { title: "Crawdaddy's", src: 'https://source.unsplash.com/800x800/?seafood', flex: 4 },
    ], */
    favourited: false,
  }),
  methods: {
    goToRestaurant (id) {
      this.$store.dispatch('RestaurantsStore/retrieveRestaurantMenu', id);
      this.$router.push("/menu/" + id);
    },
    goToCheckin () {
      this.$router.push('/checkin')
    },
    changeFavouriteFab () {
      this.favourited = !this.favourited
    },
  },
  computed: {
    ...mapGetters({
      allRestaurants: 'RestaurantsStore/getAllRestaurants',
      customerInfo: 'CustomerStore/getCustomerProfile',
    }),
    ...mapActions({
      // retrieveRestaurantMenu: ('RestaurantsStore/retrieveRestaurantMenu'),
    }),
    filteredList() {
      return this.popularFood.filter(restaurant => {
        return restaurant.title.toLowerCase().includes(this.search.toLowerCase())
      })
    },
    activateFavourite () {
      if (!this.favourited) {
        return { color: 'primary', icon: 'mdi-heart-outline' }
      } else {
        return { color: 'primary', icon: 'mdi-heart' }
      }
    },
  },
}
</script>
