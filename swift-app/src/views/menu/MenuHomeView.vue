<template>
  <div class="homemenu">
    <!-- <v-carousel height="200px" :show-arrows="false" hide-delimiter-background continuous>
      <v-carousel-item v-for="(item,i) in restaurantImages" :key="i" :src="item.img"></v-carousel-item>
    </v-carousel>-->
    <MenuSearchToolBar></MenuSearchToolBar>
    <v-container transition="slide-x-transition">
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
                <v-avatar color="grey darken-4" size="35px">
                  <img @click="goToMenuItem(1)" :src="category.img" alt />
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
          <div class="title">Popular Drinks</div>
        </v-col>
      </v-row>

      <v-sheet class="mx-auto" max-width="700">
        <v-slide-group multiple>
          <v-slide-item v-for="card in popularDrinks" :key="card.title">
            <div class="ml-0" align="center">
              <v-btn
                style="background: none;"
                width="100px"
                height="100px"
                min-width="100px"
                class="ml-0 mr-1"
              >
                <v-avatar size="80px">
                  <img :src="card.src" alt />
                </v-avatar>
              </v-btn>
              <div class="mt-1 subtitle-2">{{card.title}}</div>
            </div>
          </v-slide-item>
        </v-slide-group>
      </v-sheet>

      <v-row style="max-width: 400px" class="overflow-y-auto">
        <v-col cols="12">
          <div class="title">Popular Food</div>
        </v-col>
      </v-row>

      <v-sheet class="mx-auto" max-width="700">
        <v-slide-group multiple>
          <v-slide-item v-for="card in popularFood" :key="card.title">
            <v-card ripple class="mr-3" @click="goToMenuItem(1)">
              <v-img
                :src="card.src"
                class="white--text align-center"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                width="170px"
                height="100px"
              >
                <v-card-title class="pl-2 pt-1 body-1" v-text="card.title"></v-card-title>
                <v-card-subtitle class="pl-2 white--text subtitle-2" v-text="card.price"></v-card-subtitle>
                <v-rating
                  size="14"
                  class="pl-2"
                  dense
                  color="yellow darken-3"
                  background-color="secondary"
                  :value="card.rating"
                ></v-rating>
                <v-fab-transition>
                  <v-btn
                    @click="changeFavouriteFab"
                    :key="activateFavourite.icon"
                    :color="activateFavourite.color"
                    style="top: 3px; right: 3px; transform: scale(0.8);"
                    absolute
                    small
                    fab
                  >
                    <v-icon>{{ activateFavourite.icon }}</v-icon>
                  </v-btn>
                </v-fab-transition>
              </v-img>
            </v-card>
          </v-slide-item>
        </v-slide-group>
      </v-sheet>
    </v-container>
       <!--snackbar shows table number on successful checkin -->
      <v-snackbar id="notification" timeout=2000 transition centered color="primary" elevation="24" v-model="snackbar">{{ tableNumber }}</v-snackbar>
    <NavBar></NavBar>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import NavBar from "@/components/layout/NavBar";
import MenuSearchToolBar from "@/components/layout/MenuSearchToolBar";

export default {
  components: {
    NavBar: NavBar,
    MenuSearchToolBar: MenuSearchToolBar
  },
  data: () => ({
    restaurantImages: [
      { img: "https://source.unsplash.com/800x800/?fruit" },
      { img: "https://source.unsplash.com/800x800/?salad" },
      { img: "https://source.unsplash.com/800x800/?spaghetti" },
      { img: "https://source.unsplash.com/800x800/?sandwich" }
    ],
    categories: [
      { img: "https://source.unsplash.com/800x800/?tea", name: "Drinks" },
      { img: "https://source.unsplash.com/800x800/?salad", name: "Starters" },
      { img: "https://source.unsplash.com/800x800/?spaghetti", name: "Meals" },
      {
        img: "https://source.unsplash.com/800x800/?sandwich",
        name: "Sandwiches"
      },
      { img: "https://source.unsplash.com/800x800/?dessert", name: "Desserts" },
      { img: "https://source.unsplash.com/800x800/?alcohol", name: "Alcohol" },
      {
        img: "https://source.unsplash.com/800x800/?hamburger",
        name: "Burgers"
      },
      { img: "https://source.unsplash.com/800x800/?cake", name: "Cakes" }
    ],
    popularDrinks: [
      {
        title: "Filter Coffee",
        price: "R82.00",
        rating: 5,
        src: "https://source.unsplash.com/800x800/?coffee"
      },
      {
        title: "Boxed Water",
        price: "R52.00",
        rating: 5,
        src: "https://source.unsplash.com/800x800/?boxedwater"
      },
      {
        title: "Tea",
        price: "R62.00",
        rating: 4,
        src: "https://source.unsplash.com/800x800/?tea"
      },
      {
        title: "Juice",
        price: "R87.00",
        rating: 3,
        src: "https://source.unsplash.com/800x800/?juice"
      }
    ],
    popularFood: [
      {
        title: "Fruit Salad",
        price: "85.00",
        rating: 4,
        src: "https://source.unsplash.com/800x800/?fruit"
      },
      {
        title: "Lasagna",
        price: "R52.00",
        rating: 5,
        src: "https://source.unsplash.com/800x800/?lasagna"
      },
      {
        title: "Hamburger",
        price: "R62.00",
        rating: 4,
        src: "https://source.unsplash.com/800x800/?hamburger"
      },
      {
        title: "Seafood",
        price: "R87.00",
        rating: 3,
        src: "https://source.unsplash.com/800x800/?seafood"
      }
    ],
    favourited: false,
    snackbar: true
  }),
  methods: {
    goToMenuItem(id) {
      this.$router.push("/menuItem/" + id);
    },
    changeFavouriteFab() {
      this.favourited = !this.favourited;
    },
    ...mapActions({
      updateDisplayNotification: 'RestaurantStore/updateDisplayNotification',
    }),
  },
  mounted: function() {
    if (this.displayNotification) {
      document.getElementById("notification").style.display = "block";
      this.updateDisplayNotification(false);
    }
  },
  computed: {
    activateFavourite() {
      if (!this.favourited) {
        return { color: "primary", icon: "mdi-heart-outline" };
      } else {
        return { color: "primary", icon: "mdi-heart" };
      }
    },
    ...mapGetters({
      tableNumber: "RestaurantStore/getTableNumber",
      displayNotification: "RestaurantStore/getDisplayNotification"
    })
  }
};
</script>

<style>
#notification {
  display: none;
  position: absolute; 
  top: 0; 
  margin-top: 20px;
}
</style>
