<template>
  <!-- <section class="menuitem">
    <h1>{{menuItem.name}}</h1>
    <div class="menuItem-details">
      {{menuItem.description}}
    </div>
  </section> -->
  <div>
    <v-carousel height="200px" :show-arrows="false" hide-delimiter-background continuous style=".v-btn .v-btn__content .v-icon {color: red;}">
      <v-carousel-item
        v-for="(item,i) in items"
        :key="i"
        :src="item.img"
      ></v-carousel-item>
      <!-- <v-overlay> -->
        <v-fab-transition z-index="10">
          <v-btn @click="changeFavouriteFab" :key="activeFab.icon" :color="activeFab.color" absolute small fab bottom right>
            <v-icon>{{ activeFab.icon }}</v-icon>
          </v-btn>
        </v-fab-transition>
      <!-- </v-overlay> -->
    </v-carousel>
    
    
  </div>

</template>

<script>
import store from '../store/store.js';

export default {
  data() {
    return {
      menuItemId: this.$route.params.itemid,
      items: [
        { img: 'https://source.unsplash.com/800x800/?tea' },
        { img: 'https://source.unsplash.com/800x800/?salad' },
        { img: 'https://source.unsplash.com/800x800/?spaghetti' },
        { img: 'https://source.unsplash.com/800x800/?sandwich' },
      ],
      favourited: false,
    }
  },
  methods: {
    changeFavouriteFab () {
      this.favourited = !this.favourited
    },
  },
  computed: {
    menuItem() {
      return store.state.MenuItemsStore.menuItems.find(
        menuItem => menuItem.id === this.menuItemId
      )
    },
    activeFab () {
      if (!this.favourited) {
        return { color: 'primary', icon: 'mdi-heart-outline' }
      } else {
        return { color: 'primary', icon: 'mdi-heart' }
      }
    },
  }
}
</script>
