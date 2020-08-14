<template>
  <div class="toolbar">
    <v-card color="grey lighten-4" flat tile>
      <v-container class="pb-0">
        <div class="backgroundImage" style="margin-top: 0px">
          <v-row style="margin-top: -12px; margin-bottom: 10px"> 
            <v-col cols="12" class="pt-0 px-0 pb-0">
              <!-- <v-btn width="30px" height="30px" @click="backNavigation" color="secondary" absolute small fab style="top: 20px; left: 10px;">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn> -->
              <v-carousel height="200px" :show-arrows="false" hide-delimiter cycle hide-delimiters continuous>
<<<<<<< HEAD
                <v-carousel-item gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.4)" v-for="(item,i) in restaurantImages" :key="i" :src="item.img">
                    <v-row  align="center" justify="center" class="mt-6">
                      <div class="white--text display-1">Welcome to<br/> Mugg & Bean</div>
=======
                <v-carousel-item gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.4)" :src="menu.image">
                    <v-row  align="center" justify="center" class="mt-6">
                      <div class="white--text display-1">Welcome to<br/> {{menu.name}}</div>
>>>>>>> feature-notification
                    </v-row>
                    <v-row no-gutters d-flex flex-row align="center" justify="center" class="fill-height">
                      <v-col cols="10" style="z-index: 11">
                        <v-autocomplete style="bottom: 50px;" rounded background-color="white" color="secondary" v-model="model" :items="items" :loading="isLoading" :search-input.sync="search" chips clearable hide-details hide-selected item-text="name" item-value="symbol" label="What would you like to order?" prepend-inner-icon="mdi-magnify" solo>
                          <template v-slot:no-data>
                            <v-list-item>
                              <v-list-item-title>
                                Search for
                                <strong>food or drinks</strong>
                              </v-list-item-title>
                            </v-list-item>
                          </template>
                          <template v-slot:selection="{ attr, on, item }">
                              <v-icon left>mdi-coin</v-icon>
                              <span class="black--text" v-text="item.name"></span>
                          </template>
                          <template v-slot:item="{ item }">
                            <v-list-item-avatar color="grey darken-4" size="35px">
                              <img src="https://source.unsplash.com/800x800/?cake" alt="" >
                            </v-list-item-avatar>
                            <v-list-item-content>
                              <v-list-item-title v-text="item.name"></v-list-item-title>
                              <v-list-item-subtitle v-text="item.symbol"></v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                              <v-icon>mdi-coin</v-icon>
                            </v-list-item-action>
                          </template>
                        </v-autocomplete>
<<<<<<< HEAD
                      </v-col>
                    </v-row>
=======
                        
                      </v-col>
                    </v-row>
                    
>>>>>>> feature-notification
                </v-carousel-item>
              </v-carousel>
              <v-btn width="30px" height="30px" @click="callWaiter" :key="activeCall.icon" :color="activeCall.color" absolute small fab style="top: 20px; right: 10px;">
                <v-icon :style="called ? { 'transform': 'rotate(45deg)' } : { 'transform': 'rotate(0deg)' }">{{ activeCall.icon }}</v-icon>
              </v-btn>
<<<<<<< HEAD
            </v-col>
          </v-row>
        </div>
        <!-- <v-row>
          <v-col cols="12" class="pt-0">
            <div class="title">What would you like to order?</div>
          </v-col>
        </v-row> -->
        <!-- <v-row no-gutters d-flex flex-row >
          <v-col cols="12">
            <v-autocomplete  v-model="model" :items="items" :loading="isLoading" :search-input.sync="search" chips clearable hide-details hide-selected item-text="name" item-value="symbol" label="What would you like to order?" solo>
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-title>
                    Search for
                    <strong>food or drinks</strong>
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-slot:selection="{ attr, on, item }">
                  <v-icon left>mdi-coin</v-icon>
                  <span class="black--text" v-text="item.name"></span>
              </template>
              <template v-slot:item="{ item }">
                <v-list-item-avatar color="grey darken-4" size="35px">
                  <img src="https://source.unsplash.com/800x800/?cake" alt="" >
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="item.name"></v-list-item-title>
                  <v-list-item-subtitle v-text="item.symbol"></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>mdi-coin</v-icon>
                </v-list-item-action>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row> -->
      </v-container>
    </v-card> 
  </div>

  <!-- <v-autocomplete v-model="model" :items="items" :loading="isLoading" :search-input.sync="search" chips clearable hide-details hide-selected item-text="name" item-value="symbol" label="What would you like to order?" solo>
    <template v-slot:no-data>
      <v-list-item>
        <v-list-item-title>
          Search for your favorite
          <strong>food or drinks</strong>
        </v-list-item-title>
      </v-list-item>
    </template>
    <template v-slot:selection="{ attr, on, item, selected }">
      <v-chip v-bind="attr" :input-value="selected" color="blue-grey" class="white--text" v-on="on">
        <v-icon left>mdi-coin</v-icon>
        <span v-text="item.name"></span>
      </v-chip>
    </template>
    <template v-slot:item="{ item }">
      <v-list-item-avatar color="grey darken-4" size="35px">
        <img src="https://source.unsplash.com/800x800/?cake" alt="" >
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title v-text="item.name"></v-list-item-title>
        <v-list-item-subtitle v-text="item.symbol"></v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-icon>mdi-coin</v-icon>
      </v-list-item-action>
    </template>
  </v-autocomplete> -->
  
  <!-- <div class="toolbar">
    <v-card color="grey lighten-4" flat  :height=toolbarHeight tile>
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="title">What would you like to order?</div>
          </v-col>
        </v-row>
        <v-row no-gutters d-flex flex-row >
          <v-col cols="12">
            <v-card tile class="pa-2" >
              <v-row no-gutters>
                <v-col cols="12" >
                  <v-text-field prepend-icon="mdi-magnify" @click:prepend="searchForResults" @click:append-outer="showFilters" append-outer-icon="mdi-filter-variant" hide-details class="my-0 py-1" color="grey darken-2" clearable placeholder="Search..."></v-text-field>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-expand-transition>
          <v-row class="my-2" v-if="expand">
            <v-col class="d-flex" cols="6" sm="6">
              <v-select prepend-icon="mdi-currency-usd" color="grey darken-4" :items="prices" label="Price" solo dense></v-select>
            </v-col>
            <v-col class="d-flex" cols="6" sm="6">
              <v-select prepend-icon="mdi-sort-variant" color="grey darken-4" :items="sorting" label="Sort" solo dense></v-select>
=======
>>>>>>> feature-notification
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-card> 
  </div>
</template>

<script>
<<<<<<< HEAD
  import $ from 'jquery';

  $(window).scroll(function(){
    $(".backgroundImage").css("opacity", 1 - $(window).scrollTop() / 250);
  });

  export default {
    data: () => ({
      prices: ['low-high', 'high-low', 'R0-R49', 'R50-100'],
      sorting: ['rating', 'favourites', 'popular', 'free'],
      prepTimes: ['10 min', '20 min', '30 min', '30+ min'],
      toolbarExpanded: false,
      toolbarHeight: '140px',
      expand: false,
      called: false,
      isLoading: false,
      items: [],
      model: null,
      search: null,
      tab: null,
      restaurantImages: [
        { img: 'https://source.unsplash.com/GXXYkSwndP4/800x800/' },
      ],
    }),
    methods: {
      showFilters () {
        this.toolbarExpanded = !this.toolbarExpanded   
        this.expand = !this.expand
        
        if (!this.toolbarExpanded) {
          this.toolbarHeight = '140px';
        } else {
          this.toolbarHeight = '200px';
        }
      },
      backNavigation () {
        this.$router.push("/");
      },
      callWaiter() {
        this.called = !this.called;
=======
import $ from 'jquery';
import { mapActions, mapGetters } from "vuex";

$(window).scroll(function(){
  $(".backgroundImage").css("opacity", 1 - $(window).scrollTop() / 250);
});

export default {
  data: () => ({
    restaurantImages: [
      { img: 'https://source.unsplash.com/GXXYkSwndP4/800x800/' },
    ],
  }),
  methods: {
    showFilters () {
      this.toolbarExpanded = !this.toolbarExpanded   
      this.expand = !this.expand
      
      if (!this.toolbarExpanded) {
        this.toolbarHeight = '140px';
      } else {
        this.toolbarHeight = '200px';
>>>>>>> feature-notification
      }
    },
    backNavigation () {
      this.$router.push("/");
    },
    callWaiter() {
      this.called = !this.called;
    }
  },
  watch: {
    model (val) {
      if (val != null) this.tab = 0
      else this.tab = null
    },
    search (val) {
      if (this.items.length > 0) return

      this.isLoading = true

      fetch('https://api.coingecko.com/api/v3/coins/list')
        .then(res => res.clone().json())
        .then(res => {
          this.items = res
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => (this.isLoading = false))
    },
  },
  computed: {
    ...mapGetters({
      menu: "MenuStore/getMenu"
    }),
    activeCall() {
      if (!this.called) {
        return { color: "white", icon: "mdi-bell-outline" };
      } else {
        return { color: "primary", icon: "mdi-bell-outline" };
      }
    },
<<<<<<< HEAD
    computed: {
      activeCall() {
        if (!this.called) {
          return { color: "white", icon: "mdi-bell-outline" };
        } else {
          return { color: "primary", icon: "mdi-bell-outline" };
        }
      },
    }
  } 
=======
  }
} 
>>>>>>> feature-notification
</script>

<style>

input, label, .mdi-magnify, .mdi-menu-down {
  color: #343434 !important;
}

label {
  opacity: 0.55;
}

.v-text-field--rounded > .v-input__control > .v-input__slot {
  padding-left: 18px;
}
<<<<<<< HEAD
=======
.searchBarBg .v-input__slot {
  background: rgba(0, 0, 0, 0.06) !important;
  caret-color: #343434 !important;
  color: #343434 !important;
}
>>>>>>> feature-notification
</style>
