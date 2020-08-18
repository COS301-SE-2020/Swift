<template>
  <div class="toolbar">
    <v-card color="grey lighten-4" flat tile>
      <v-container class="pb-0">
        <div class="backgroundImage" style="margin-top: 0px">
          <v-row style="margin-top: -12px; margin-bottom: 10px"> 
            <v-col cols="12" class="pt-0 px-0 pb-0">
              <v-carousel height="200px" :show-arrows="false" hide-delimiter cycle hide-delimiters continuous>
                <v-carousel-item gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.4)" :src="menu.image">
                  <v-row  align="center" justify="center" class="mt-6">
                    <div class="white--text display-1">Welcome to<br/> {{menu.name}}</div>
                    <v-col cols="10" class="mt-3">
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
              <v-btn width="30px" height="30px" @click="callWaiterPressed" :key="activeCall.icon" :color="activeCall.color" absolute small fab style="top: 20px; right: 10px;">
                <v-icon :style="called ? { 'transform': 'rotate(45deg)' } : { 'transform': 'rotate(0deg)' }">{{ activeCall.icon }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-card> 
  </div>
</template>

<script>
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
    items: [],
    isLoading: false,
    search: '',
    called: false
  }),
  methods: {
    backNavigation () {
      this.$router.push("/");
    },
    callWaiterPressed() {
      var tableId = localStorage.getItem('checkedInTableId');
      this.callWaiter(tableId)
      this.called = !this.called; 
      
      setTimeout(function() { 
        this.called = !this.called;
      }, 5000);
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
    ...mapActions({
      callWaiter: 'CustomerStore/callWaiter',
    }),
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
  }
} 
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
.menuItemSearchbar {
  background: rgba(0, 0, 0, 0.06) !important;
  caret-color: #343434 !important;
  color: #343434 !important;
}

</style>
