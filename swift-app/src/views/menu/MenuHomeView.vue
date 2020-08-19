<template>
  <div class="homemenu">
    <!-- <MenuSearchToolBar></MenuSearchToolBar> -->
    <v-container class="pb-0">
      <div class="backgroundImage" style="margin-top: 0px">
        <v-row style="margin-top: -12px; margin-bottom: 10px"> 
            <v-col cols="12" class="pt-0 px-0 pb-0">
              <v-carousel height="200px" :show-arrows="false" hide-delimiter cycle hide-delimiters continuous>
                <v-carousel-item gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.4)" :src="menu.image">
                  <v-row  align="center" justify="center" class="mt-6">
                    <div v-if="checkedIn()" class="white--text display-1">Welcome to<br/> {{menu.name}}</div>
                    <div v-if="!checkedIn()" class="white--text display-1">{{menu.name}}</div>
                    <v-col cols="9" class="mt-3">
                      <v-text-field background-color="white" class="menuItemSearchbar"  v-model="search" rounded clearable solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search by name or category"></v-text-field>
                    </v-col>
                    <v-col cols="1" class="d-flex align-center px-0 mt-3">
                      <v-btn small icon color="white">
                        <v-icon size="24px">mdi-filter-variant</v-icon> 
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-carousel-item>
              </v-carousel>
              <v-btn width="30px" height="30px" @click="backNavigation" color="secondary" absolute small fab style="top: 20px; left: 15px;">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn v-if="checkedIn()" width="30px" height="30px" @click="callWaiterPressed()" :key="activeCall.icon" :color="activeCall.color" absolute small fab style="top: 20px; right: 10px;">
                <v-icon :style="called ? { 'transform': 'rotate(45deg)' } : { 'transform': 'rotate(0deg)' }">{{ activeCall.icon }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>
    </v-container>
    <v-container class="px-0 overflow-x-hidden" transition="slide-x-transition">
      <v-row style="max-width: 400px" class="overflow-y-auto">
        <v-col cols="12" class="pt-0">
          <div class="title pl-3">Categories</div>
        </v-col>
      </v-row>
      <!-- <div id="categories" class="pl-3">
        <v-sheet class="mx-auto" max-width="700">
          <v-slide-group multiple>
            <v-slide-item v-for="(category, index) in menu.categories" :key="index">
              <div class="ml-0" align="center" style="margin-top: 10px;">
                <v-btn dark width="50px" height="50px" min-width="50px" class="mx-2">
                  <v-avatar color="grey darken-4" size="35px">
                    <img @click="goToMenuItem(1)" src="https://source.unsplash.com/800x800/?fruit" alt />
                  </v-avatar>
                </v-btn>
                <div class="mt-1 caption">{{category.categoryName}}</div>
              </div>
            </v-slide-item>
          </v-slide-group>
        </v-sheet>
        <v-divider class="mt-2"></v-divider>
      </div> -->


      <!-- =========================================================================================================== -->

        <v-tabs  v-model="secondaryCategoryTab" background-color="secondary" color="primary" dark>
          <v-tab v-for="(category, index) in menu.categories" :key="index">
            {{ category.categoryName }}
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="secondaryCategoryTab">
          <v-tab-item v-for="(category, index) in menu.categories" :key="index">
            <v-list v-for="(menuItem, i) in category.menuItems" :key="i" class="py-0">
              <v-list-item @click="goToMenuItem(menuItem.menuItemId)"  ripple class="py-1 ">
                <v-list-item-avatar tile  style="border-radius: 4px" size="45" >
                  <img src="https://source.unsplash.com/collection/767186/800x800">
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-html="menuItem.menuItemName"></v-list-item-title>
                  <v-list-item-subtitle v-html="menuItem.menuItemDescription"></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action-text class="subtitle-1">R{{menuItem.price}}0</v-list-item-action-text>
                

              </v-list-item>
              <v-divider divider class="ml-3" width="93%"></v-divider>
            </v-list>
          </v-tab-item>
        </v-tabs-items>

    </v-container>
    <v-snackbar :v-if=checkedInStatus id="notification" :timeout="2000" centered color="primary" elevation="24" v-model="snackbar">You have been checked-in to {{menu.name}}</v-snackbar>
    <NavBar></NavBar>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import NavBar from "@/components/layout/NavBar";
import MenuSearchToolBar from "@/components/layout/MenuSearchToolBar";
import $ from 'jquery';

$(window).scroll(function(){
  $(".backgroundImage").css("opacity", 1 - $(window).scrollTop() / 250);
});

export default {
  components: {
    NavBar: NavBar,
    MenuSearchToolBar: MenuSearchToolBar
  },
  data: () => ({
    restaurantImages: [
      { img: 'https://source.unsplash.com/GXXYkSwndP4/800x800/' },
    ],
    search: '',
    primaryCategoryTab: null,
    secondaryCategoryTab: null,
    items: [
      { tab: 'Coffee and Tea', content: 'Tab 1 Content' },
      { tab: 'Soft Drinks', content: 'Tab 2 Content' },
      { tab: 'Alcohol', content: 'Tab 3 Content' },
    ],

    restaurantImages: [
      { img: "https://source.unsplash.com/800x800/?fruit" },
      { img: "https://source.unsplash.com/800x800/?salad" },
      { img: "https://source.unsplash.com/800x800/?spaghetti" },
      { img: "https://source.unsplash.com/800x800/?sandwich" }
    ],
    categories: [
      { img: "https://source.unsplash.com/800x800/?tea", name: "Drinks" },
      { img: "https://source.unsplash.com/800x800/?salad", name: "Starters" },
      { img: "https://source.unsplash.com/800x800/?spaghetti", name: "Meals" },
      {
        img: "https://source.unsplash.com/800x800/?sandwich",
        name: "Sandwiches"
      },
      { img: "https://source.unsplash.com/800x800/?dessert", name: "Desserts" },
      { img: "https://source.unsplash.com/800x800/?alcohol", name: "Alcohol" },
      {
        img: "https://source.unsplash.com/800x800/?hamburger",
        name: "Burgers"
      },
      { img: "https://source.unsplash.com/800x800/?cake", name: "Cakes" }
    ],
    popularDrinks: [
      {
        title: "Filter Coffee",
        price: "R82.00",
        rating: 5,
        src: "https://source.unsplash.com/800x800/?coffee"
      },
      {
        title: "Boxed Water",
        price: "R52.00",
        rating: 5,
        src: "https://source.unsplash.com/800x800/?boxedwater"
      },
      {
        title: "Tea",
        price: "R62.00",
        rating: 4,
        src: "https://source.unsplash.com/800x800/?tea"
      },
      {
        title: "Juice",
        price: "R87.00",
        rating: 3,
        src: "https://source.unsplash.com/800x800/?juice"
      }
    ],
    called: false,
    favourited: false,
    snackbar: true,
  }),
  methods: {
    goToMenuItem(id) {
      this.$router.push("/menuItem/" + id);
    },
    changeFavouriteFab() {
      this.favourited = !this.favourited;
    },
    backNavigation () {
      this.$router.push('/')
    },
    async callWaiterPressed() {
      var tableId = localStorage.getItem('checkedInTableId');
      // await this.callWaiter(tableId)
      this.called = true; 
      
      setTimeout(() => { 
        this.called = false;
      }, 5000);
    },
    checkedIn() {
      let checkedInStatus = this.checkedInStatus

      if (checkedInStatus == true && checkedInStatus != null) {
        return true;
      } else {
        return false;
      } 
    },
    sortedItems (menuItems) {
      console.log()
      // if (menuItems.length != undefined)
    	  // return menuItems.sort((a, b) => a.menuItemName < b.menuItemNam ? 1 : -1)
    }
  },
  mounted: function() {
    if (this.displayNotification) {
      document.getElementById("notification").style.display = "block";
      this.updateDisplayNotification(false);
    }
  },
  computed: {
    activateFavourite() {
      if (!this.favourited) {
        return { color: "primary", icon: "mdi-heart-outline" };
      } else {
        return { color: "primary", icon: "mdi-heart" };
      }
    },
    ...mapActions({
      updateDisplayNotification: 'RestaurantsStore/updateDisplayNotification',
      retrieveMenu: 'MenuStore/retrieveMenu',
      callWaiter: 'CustomerStore/callWaiter'
    }),
    ...mapGetters({
      displayNotification: "RestaurantsStore/getDisplayNotification",
      menu: "MenuStore/getMenu",
      checkedInStatus: 'CustomerStore/getCheckedInStatus',
    }),
    activeCall() {
      if (!this.called) {
        return { color: "white", icon: "mdi-bell-outline" };
      } else {
        return { color: "primary", icon: "mdi-bell-outline" };
      }
    },
  }
};
</script>

<style>
#notification {
  display: none;
  position: absolute; 
  top: 0; 
  margin-top: 20px;
}

#categories {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 10;
  background-color: white;
}

.v-tabs:not(.v-tabs--vertical):not(.v-tabs--right) > .v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-tabs-bar--show-arrows):not(.v-slide-group--has-affixes) .v-slide-group__prev {
  display: none
}

input, label, .mdi-magnify, .mdi-menu-down {
  color: #343434 !important;
}

label {
  opacity: 0.55;
}

.v-text-field--rounded > .v-input__control > .v-input__slot {
  padding-left: 18px;
}
.menuItemSearchbar {
  background: rgba(0, 0, 0, 0.06) !important;
  caret-color: #343434 !important;
  color: #343434 !important;
}
</style>
