<template>
  <div class="toolbar">
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
                <!-- <v-col class="d-flex" cols="4" sm="4">
                    <v-select prepend-icon="mdi-clock-outline" color="grey darken-4" :items="prepTimes" label="Time" solo dense></v-select>
                </v-col> -->
            </v-row>
          </v-expand-transition>
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
    }),
    methods: {
      searchForResults () {
        
      },
      showFilters () {
        // var { seen, toolbarHeight, toolbarExpanded } = this; 
        this.toolbarExpanded = !this.toolbarExpanded   
        this.expand = !this.expand
        
        if (!this.toolbarExpanded) {
          this.toolbarHeight = '140px';
        } else {
          this.toolbarHeight = '200px';
        }
      },
    },
  } 
</script>
