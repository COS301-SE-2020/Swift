<template>
  <v-container fluid>
    <v-row class="mt-0 pt-0" align="center">
      <v-col cols="12"  align="center">
        <span style="font-size: 24px">My Favourites</span>
      </v-col>
    </v-row>
    <v-data-iterator :items="items" :search="search" hide-default-footer>
      <template v-slot:header>
        <v-text-field class="searchBarBg" v-model="search" rounded clearable flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"></v-text-field>
      </template>

      <template v-slot:default="props">
        <v-subheader style="height: 20px" class="mt-3 mb-1 pl-1"  :key="restaurant" v-text="restaurant"></v-subheader>
        <v-list v-for="item in props.items" :key="item.title" class="py-0">
          <v-list-item ripple class="py-1 pr-0">
            <v-list-item-avatar tile  style="border-radius: 4px" size="45" >
              <v-img :src="item.avatar"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title v-html="item.title"></v-list-item-title>
              <v-list-item-subtitle v-html="item.description"></v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action class="ml-0 mt-0">
              <v-btn icon>
                <v-icon color="primary">mdi-heart</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider divider class="ml-3" width="93%"></v-divider>
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
        search: '',
        filter: {},
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
            avatar: 'https://source.unsplash.com/hrlvr2ZlUNk/800x800/',
          },
          {
            title: 'Pizza',
            description: 'Made on whole grain toast with mashed avocado, a runny egg and a few dashes of hot sauce - it is...',
            avatar: 'https://source.unsplash.com/800x800/?restaurant',
          },
          
        ],
      }
    },
    computed: {
      filteredKeys () {
        return this.keys.filter(key => key !== `Title`)
      },
    },
    components: {
      'NavBar': NavBar
    }
    
  }
</script>
<style>
.searchBarBg .v-input__slot {
  background: rgba(0, 0, 0, 0.06) !important;
  caret-color: #343434 !important;
  color: #343434 !important;
}
</style>