<template>
  <v-card :loading="loading" class="mx-auto">
    <v-carousel height="200px" :show-arrows="false" hide-delimiter-background continuous>
      <v-carousel-item
        v-for="(item,i) in items"
        :key="i"
        :src="item.img"
      ></v-carousel-item>
    </v-carousel>
    <v-btn color="secondary" absolute small fab style="top: 175px; right: 65px;">
      <v-icon>mdi-cube-scan</v-icon>
    </v-btn>
    <v-fab-transition>
      <v-btn @click="changeFavouriteFab" :key="activateFavourite.icon" :color="activateFavourite.color" style="top: 175px;" absolute small fab  right >
        <v-icon>{{ activateFavourite.icon }}</v-icon>
      </v-btn>
    </v-fab-transition>

    <v-card-title class="pb-0">{{menuItem.name}}</v-card-title>

    <v-card-text>
      <v-row align="center" class="mx-0">
        <v-col cols="3" class="px-0 py-0">
          <v-rating size="18" dense color="yellow darken-3" background-color="secondary" :value=menuItem.rating></v-rating>
        </v-col>
        <v-col cols="4" class="py-0">
          <div class="grey--text ml-4 my-4">(413)</div>
        </v-col>
        <v-col cols="5" class="pr-0 py-0">
          <div class="title ml-8 black--text">R{{menuItem.price}}</div>
        </v-col>
      </v-row>
      <div class="justify">{{menuItem.description}}</div>
    </v-card-text>

    <!-- <v-bottom-navigation grow  color="primary">
      <v-btn class="align-center px-0" min-height="56px">
        <span class="subtitle-1">Details</span>
      </v-btn>
      <v-btn class="align-center px-0" min-height="56px">
        <span class="subtitle-1">Reviews</span>
      </v-btn>
    </v-bottom-navigation> -->

    <v-card-title class="pb-0">Customise Order</v-card-title>
    <v-list class="py-0">
      <v-list-group v-for="item in listItems" :key="item.title" v-model="item.active"  no-action>
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </template>

        <v-list-item ripple v-for="subItem in item.items" :key="subItem.title" height="20px" class="pl-5 py-0 my-0">
          <v-list-item-content>
            <v-list-item-title v-text="subItem.title"></v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon class="my-1">
            <v-btn icon>
              <v-icon color="secondary" v-text="subItem.icon"></v-icon>
            </v-btn>
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>
    </v-list>

    <!-- <v-card-text>
      <v-chip-group v-model="selection" active-class="deep-purple accent-4 white--text" column>
        <v-chip>5:30PM</v-chip>
        <v-chip>7:30PM</v-chip>
        <v-chip>8:00PM</v-chip>
        <v-chip>9:00PM</v-chip>
      </v-chip-group>
    </v-card-text>

    <v-card-actions>
      <v-btn color="deep-purple lighten-2" text @click="reserve">
        Reserve
      </v-btn>
    </v-card-actions> -->
  </v-card>

  

</template>

<script>
import store from '../store/store.js';

export default {
  data() {
    return {
      menuItemId: this.$route.params.itemid,
      items: [
        { img: 'https://source.unsplash.com/800x800/?fruit' },
        { img: 'https://source.unsplash.com/800x800/?salad' },
        { img: 'https://source.unsplash.com/800x800/?spaghetti' },
        { img: 'https://source.unsplash.com/800x800/?sandwich' },
      ],
      favourited: false,
      loading: false,
      selection: 1,
      listItems: [
        {
          title: 'Choose fruit:',
          active: false,
          items: [
            { title: '- Strawberries', icon: 'mdi-radiobox-marked', extra: '', selected: true },
            { title: '- Mango', icon: 'mdi-radiobox-blank', extra: '+ R2.00', selected: true },
            { title: '- Pear', icon: 'mdi-radiobox-blank', extra: '', selected: true },
          ],
        },
        {
          title: 'Choose nuts:',
          active: false,
          items: [
            { title: '- Pecan', icon: 'mdi-check-box-outline', extra: '', selected: true },
            { title: '- Hazelnut', icon: 'mdi-check-box-outline', extra: '+ R2.00', selected: true },
            { title: '- Pistaccio', icon: 'mdi-checkbox-blank-outline', extra: '', selected: true },
          ],
        },
      ],
    }
  },
  methods: {
    changeFavouriteFab () {
      this.favourited = !this.favourited
    },
    reserve () {
      this.loading = true
      setTimeout(() => (this.loading = false), 3000)
    },
  },
  computed: {
    menuItem() {
      return store.state.MenuItemsStore.menuItems.find(
        menuItem => menuItem.id === this.menuItemId
      )
    },
    activateFavourite () {
      if (!this.favourited) {
        return { color: 'primary', icon: 'mdi-heart-outline' }
      } else {
        return { color: 'primary', icon: 'mdi-heart' }
      }
    },
  }
}
</script>
