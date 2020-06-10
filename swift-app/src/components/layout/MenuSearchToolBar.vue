<template>
  <div class="toolbar">
    <v-card color="grey lighten-4" flat tile>
      <v-container>
        <v-row>
          <v-col cols="12" class="pt-0 px-0">
            <v-carousel height="200px" :show-arrows="false" hide-delimiter cycle hide-delimiters continuous>
              <v-carousel-item gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.4)" v-for="(item,i) in restaurantImages" :key="i" :src="item.img">
                  <v-row class="fill-height" align="center" justify="center">
                    <div class="white--text display-1">Welcome to<br/> Mugg & Bean</div>
                  </v-row>
              </v-carousel-item>
            </v-carousel>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="pt-0">
            <div class="title">What would you like to order?</div>
          </v-col>
        </v-row>
        <v-row no-gutters d-flex flex-row >
          <v-col cols="12">
            <v-autocomplete  v-model="model" :items="items" :loading="isLoading" :search-input.sync="search" chips clearable hide-details hide-selected item-text="name" item-value="symbol" label="Search..." solo>
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-title>
                    Search for a
                    <strong>restaurant</strong>
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
        </v-row>
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
            </v-col>
          </v-row>
        </v-expand-transition>
      </v-container>
    </v-card> 
  </div> -->
</template>

<script>
  export default {
    data: () => ({
      prices: ['low-high', 'high-low', 'R0-R49', 'R50-100'],
      sorting: ['rating', 'favourites', 'popular', 'free'],
      prepTimes: ['10 min', '20 min', '30 min', '30+ min'],
      toolbarExpanded: false,
      toolbarHeight: '140px',
      expand: false,

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
  } 
</script>
