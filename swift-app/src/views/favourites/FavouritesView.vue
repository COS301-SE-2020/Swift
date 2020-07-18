<template>
  <v-container fluid>
    <v-row class="mt-0 pt-0" align="center">
      <v-col cols="12"  align="center">
        <span style="font-size: 24px">My Favourites</span>
      </v-col>
    </v-row>
    <v-data-iterator :items="items" :items-per-page.sync="itemsPerPage" :page="page" :search="search" :sort-desc="sortDesc" hide-default-footer>
      <template v-slot:header>
          <v-text-field v-model="search"  clearable flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"></v-text-field>
      </template>

      <template v-slot:default="props">
        <v-subheader style="height: 20px" class="mt-3 mb-1"  :key="restaurant" v-text="restaurant"></v-subheader>
        <v-list v-for="item in props.items" :key="item.title" class="py-0">
          
          <v-list-item ripple>
            <v-list-item-avatar>
              <v-img :src="item.avatar"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title v-html="item.title"></v-list-item-title>
              <v-list-item-subtitle v-html="item.description"></v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon>
                <v-icon color="grey lighten-1">mdi-information</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider divider inset></v-divider>
        </v-list>
      </template>

    </v-data-iterator>
    <NavBar></NavBar>
  </v-container>

</template>

<script>
import NavBar from '@/components/layout/NavBar';

  export default {
    data () {
      return {
        itemsPerPageArray: [4, 8, 12],
        search: '',
        filter: {},
        sortDesc: false,
        page: 1,
        itemsPerPage: 4,
        sortBy: 'title',
        keys: [
          'Restaurant',
          'Title',
          'Description',
          'Avatar',
        ],
        restaurant: 'Mugg & Bean',
        items: [
          {
            title: 'Egg and avo on toast',
            description: 'Made on whole grain toast with mashed avocado, a runny egg and a few dashes of hot sauce - it is...',
            avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
          },
          {
            title: 'Pizza',
            description: 'Made on whole grain toast with mashed avocado, a runny egg and a few dashes of hot sauce - it is...',
            avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
          },
          
        ],
      }
    },
    computed: {
      numberOfPages () {
        return Math.ceil(this.items.length / this.itemsPerPage)
      },
      filteredKeys () {
        return this.keys.filter(key => key !== `Title`)
      },
    },
    methods: {
      nextPage () {
        if (this.page + 1 <= this.numberOfPages) this.page += 1
      },
      formerPage () {
        if (this.page - 1 >= 1) this.page -= 1
      },
      updateItemsPerPage (number) {
        this.itemsPerPage = number
      },
    },
    components: {
      'NavBar': NavBar
    }
  }
</script>