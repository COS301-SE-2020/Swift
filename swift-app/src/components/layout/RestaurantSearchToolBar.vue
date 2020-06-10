<template>
  <div class="toolbar">
    <v-card color="grey lighten-4" flat :height=toolbarHeight tile>
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="title">Where would you like to eat?</div>
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
