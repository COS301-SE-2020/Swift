<template>
  <div class="homemenu">
    <RestaurantSearchToolBar></RestaurantSearchToolBar>
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
                <v-btn dark width="50px" height="50px" min-width="50px" class="mx-2">
                  <v-avatar size="35px">
                    <v-icon>{{ category.icon }}</v-icon>
                  </v-avatar>
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
          <v-col v-for="restaurant in allRestaurants" :key="restaurant.name" cols="4">
            <v-card ripple>
              <v-img @click="goToRestaurant(restaurant.restaurantId)" :src="restaurant.image" class="white--text align-center" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="120px">
                <v-card-title class="body-1 pa-2" v-text="restaurant.name"></v-card-title>
                <v-card-text><v-rating :value="restaurant.rating" readonly size="18" dense color="yellow darken-3" background-color="secondary" ></v-rating></v-card-text>
              </v-img>
            </v-card>
          </v-col>
        </v-row>

      <v-btn class="checkInBtn" @click=goToCheckin app color="primary" style="bottom: 20px; right: 20px;" absolute  fab  >
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
    categories: [
      { icon: 'mdi-pizza', name: 'Pizza' },
      { icon: 'mdi-hamburger', name: 'Hamburgers' },
      { icon: 'mdi-fish', name: 'Seafood' },
      { icon: 'mdi-noodles', name: 'Asian' },
      { icon: 'mdi-apple', name: 'Healthy' },
      { icon: 'mdi-food', name: 'Fast Food' },
      { icon: 'mdi-food-croissant', name: 'Bakery' },
      { icon: 'mdi-coffee', name: 'Cafe' },
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
    }),
    ...mapActions({
      // retrieveRestaurantMenu: ('RestaurantsStore/retrieveRestaurantMenu'),
    }),
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
