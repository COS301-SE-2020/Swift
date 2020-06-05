<template>
  <div class="homemenu">
    <SearchToolBar></SearchToolBar>
    <!-- <transition-group> -->
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
                  <v-avatar color="grey darken-4" size="35px">
                    <img @click="goToMenuItem(1)" :src=category.img alt="" >
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
      </v-container>
    <NavBar></NavBar>
  </div>
</template>

<script>
import NavBar from '@/components/layout/NavBar';
import SearchToolBar from '@/components/layout/SearchToolBar';

export default {
  components: {
    'NavBar': NavBar,
    'SearchToolBar': SearchToolBar
  },
  data: () => ({
    categories: [
      { img: 'https://source.unsplash.com/800x800/?tea', name: 'Drinks' },
      { img: 'https://source.unsplash.com/800x800/?salad', name: 'Starters' },
      { img: 'https://source.unsplash.com/800x800/?spaghetti', name: 'Meals' },
      { img: 'https://source.unsplash.com/800x800/?sandwich', name: 'Sandwiches' },
      { img: 'https://source.unsplash.com/800x800/?dessert', name: 'Desserts' },
      { img: 'https://source.unsplash.com/800x800/?alcohol', name: 'Alcohol' },
      { img: 'https://source.unsplash.com/800x800/?hamburger', name: 'Burgers' },
      { img: 'https://source.unsplash.com/800x800/?cake', name: 'Cakes' },
    ]
  }),
  methods: {
    goToMenuItem (id) {
      this.$router.push('/menuItem/' + id)
    },
  },
}
</script>
