<template>
  <v-card class="mx-auto" flat>
    <v-carousel height="200px" :show-arrows="false" hide-delimiter-background continuous>
      <v-carousel-item v-for="(item,i) in items" :key="i" :src="item.img"></v-carousel-item>
    </v-carousel>
    <v-btn width="30px" height="30px" @click="backNavigation" color="secondary" absolute small fab style="top: 10px; left: 10px;">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-btn @click="openARScanner" color="secondary" absolute small fab style="top: 175px; right: 65px;">
      <v-icon>mdi-cube-scan</v-icon>
    </v-btn>
    <v-fab-transition>
      <v-btn @click="changeFavouriteFab" :key="activateFavourite.icon" :color="activateFavourite.color" style="top: 175px;" absolute small fab  right >
        <v-icon>{{ activateFavourite.icon }}</v-icon>
      </v-btn>
    </v-fab-transition>

    <v-card-text class="pb-0 pt-3">
      <v-row class="mx-0">
        <v-col cols="9" class="pl-0 pb-0">
          <span class="title black--text">{{menuItem.name}}</span>
        </v-col>
        <v-col cols="3" class="pl-0 pb-0">
          <span class="title black--text">R120.00</span>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-text class="pt-0" >
      <v-row align="center" class="mx-0" >
        <v-col cols="8" class="px-0 py-0">
          <v-rating size="18" dense color="yellow darken-3" background-color="secondary" :value=menuItem.rating></v-rating>
        </v-col>
        <v-col cols="4" class="py-0">
          <div color="secondary" class="ml-5 my-4"><v-icon color="secondary">mdi-clock</v-icon> 15 min</div>
        </v-col>
      </v-row>
      <div class="justify">{{menuItem.description}}</div>
    </v-card-text>

    
      <v-tabs v-model="tab" background-color="white" grow>
        <v-tab>
          Details
        </v-tab>
        <v-tab>
          Reviews (0)
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-card flat>
            <v-card-title class="pb-0 pt-4">Customise Order</v-card-title>
            <v-container>
              <v-card-text class="py-0">
                <v-row>
                  <v-col class="pl-0" cols="3">
                    <span class="subtitle-1" >Size:</span>
                  </v-col>
                  <v-col cols="auto" class="py-0">
                    <v-chip-group v-model="selection" active-class="primary" mandatory>
                      <v-chip>Small</v-chip>
                      <v-chip>Medium</v-chip>
                      <v-chip>Large</v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-text class="py-0">
                <v-row>
                  <v-col class="pl-0" cols="3">
                    <span class="subtitle-1" >Quantity:</span>
                  </v-col>
                  <v-col cols="auto" class="py-0">
                    <v-chip-group active-class="primary">
                      <v-chip>
                        <v-avatar>
                          <v-icon>mdi-plus</v-icon>
                        </v-avatar>
                      </v-chip>
                      <v-chip color="white" active-class="white">0</v-chip>
                      <v-chip>
                        <v-avatar>
                          <v-icon>mdi-minus</v-icon>
                        </v-avatar>
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-divider></v-divider>

              <v-list class="py-0">
                <v-list-group  v-for="item in menuItemSelections" :key="item.title" v-model="item.active"  no-action>
                  <template v-slot:activator>
                    <v-list-item-content>
                      <v-list-item-title  v-text="item.title"></v-list-item-title>
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
              <v-expand-x-transition>
                <v-btn block v-if="expandOrderBtn"  @click="changeOrderBtn" rounded class="py-6 mt-5" color="primary">Add To Order</v-btn>
                <v-btn block v-if="!expandOrderBtn" @click="changeOrderBtn" rounded class="py-6 mt-5" color="accent">R240 | Place Order</v-btn>
              </v-expand-x-transition>
            </v-container>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <v-card-text>No reviews yet</v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
  </v-card>
</template>

<script>
import store from '@/store/store.js';

export default {
  data() {
    return {
      menuItemId: this.$route.params.itemid,
      expandOrderBtn: true,
      items: [
        { img: 'https://source.unsplash.com/hrlvr2ZlUNk/800x800/' },
        { img: 'https://source.unsplash.com/1BZ8eDz7sAA/800x800/' },
        { img: 'https://source.unsplash.com/8manzosDSGM/800x800/' },
        { img: 'https://source.unsplash.com/nTZOILVZuOg/800x800/' },
      ],
      tab: null,
      favourited: false,
      menuItemSelections: [
        {
          title: 'Choose fruit:',
          active: false,
          items: [
            { title: '- Strawberry', icon: 'mdi-check-box-outline', extra: '', selected: true },
            { title: '- Mango', icon: 'mdi-check-box-outline', extra: '+ R2.00', selected: true },
            { title: '- Berry', icon: 'mdi-checkbox-blank-outline', extra: '', selected: true },
          ],
        },
        {
          title: 'Choose nut type:',
          active: false,
          items: [
            { title: '- Pecan', icon: 'mdi-radiobox-marked', extra: '', selected: true },
            { title: '- Hazelnut', icon: 'mdi-radiobox-blank', extra: '+ R2.00', selected: true },
            { title: '- Pistaccio', icon: 'mdi-radiobox-blank', extra: '', selected: true },
          ],
        },
        {
          title: 'Choose Yogurt type:',
          active: false,
          items: [
            { title: '- Greek', icon: 'mdi-radiobox-marked', extra: '', selected: true },
            { title: '- Bulgarian', icon: 'mdi-radiobox-blank', extra: '', selected: true },
            { title: '- Strawberry', icon: 'mdi-radiobox-blank', extra: '+ R4.50', selected: true },
          ],
        },
      ],
      selected: ['John'],
      text: 'small',
      selection: 0,
      prices: ['low-high', 'high-low', 'R0-R49', 'R50-100'],
    }
  },
  methods: {
    backNavigation () {
      this.$router.back()
    },
    changeFavouriteFab () {
      this.favourited = !this.favourited
    },
    changeOrderBtn () {
      this.expandOrderBtn = !this.expandOrderBtn
    },
    openARScanner() {
      return this.$ionic.alertController
        .create({
          header: 'Augmented Reality',
          subHeader: 'Coming Soon',
          message: 'This feature will be added in a future build.',
          buttons: ['OK']
        })
        .then(a => a.present())  
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
