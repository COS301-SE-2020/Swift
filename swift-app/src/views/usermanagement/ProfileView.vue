<template>
  <v-container class="pa-0" style="overflow-x: hidden">
    <v-row class="mt-2">
      <v-col cols="12" class="pb-0" align="center">
        <span style="font-size: 24px">My Profile</span>
      </v-col>
      <!-- <v-col cols="2">
        <v-btn width="30px" height="30px" @click="editProfile" color="secondary" absolute small fab style="top: 20px; right: 15px;">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-col> -->
    </v-row>
    <v-row class="mt-0 pt-4" align="center">
      <v-col cols="12" class="pt-0" align="center">
        <image-input v-model="avatar">
          <div slot="activator">
            <v-avatar height="120" width="120" v-ripple v-if="!avatar"  class="grey lighten-3 mb-3">
              <v-img :src="customerInfo.profileimageurl" cover alt="avatar"></v-img>
            </v-avatar>
            <v-avatar height="120" width="120" v-ripple v-else class="mb-3">
              <v-img :src="avatar.imageURL" cover alt="avatar"></v-img>
            </v-avatar>
          </div>
        </image-input>
        <!-- <v-slide-x-transition>
          <v-btn v-if="avatar && saved == false" width="30px" height="30px" @click="editProfile" color="secondary" absolute small fab style="top: 90px; right: 115px;">
            <v-icon @click="uploadImage" :loading="saving">mdi-check</v-icon>
          </v-btn>
        </v-slide-x-transition> -->
      </v-col>
    </v-row>
    <!-- <v-row class="mt-0 pt-0" align="center">
      <v-col cols="12" class="pt-0" align="center">
        <v-avatar height="120" width="120">
          <img :src="customerInfo.profileimageurl" alt="John"/>
        </v-avatar>
      </v-col>
    </v-row> -->
    <v-row>
      <v-col cols="12" class="py-0" align="center">
        <span style="font-size: 20px">{{customerInfo.name}} {{customerInfo.surname}}</span>
      </v-col>
      <v-col cols="12" class="py-0" align="center">
        <span style="font-size: 16px">{{customerInfo.email}}</span>
      </v-col>
    </v-row>

    <v-tabs class="mt-2" height="60px" v-model="tab" background-color="white" grow>
      <v-tab>
        Profile Info
      </v-tab>
      <v-tab>
        General Settings
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-list subheader class="pt-2">
          <!-- <v-list-item  v-ripple>
            <v-tooltip v-if="!$vuetify.theme.dark" bottom>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" color="info" small fab @click="darkMode">
                  <v-icon class="mr-1">mdi-moon-waxing-crescent</v-icon>
                </v-btn>
              </template>
              <span>Dark Mode On</span>
            </v-tooltip>

            <v-tooltip v-else bottom>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" color="info" small fab @click="darkMode">
                  <v-icon color="yellow">mdi-white-balance-sunny</v-icon>
                </v-btn>
              </template>
              <span>Dark Mode Off</span>
            </v-tooltip>
          </v-list-item> -->
          <v-list-item  v-ripple>
            <v-list-item-avatar>
              <v-icon class="grey lighten-2 secondary--text" >mdi-theme-light-dark</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>Dark Mode</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon >
                <v-switch @click="darkMode" color="secondary" :value="darkMode" hide-details></v-switch>
                <!-- <v-icon @click=changeTheme() v-if="customerInfo.theme == 'light'" color="secondary">mdi-radiobox-blank</v-icon> -->
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-list-item  v-ripple>
            <v-list-item-avatar>
              <v-icon class="grey lighten-2 secondary--text" >mdi-credit-card-outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>Payment Information</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon>
                <v-icon color="secondary">mdi-chevron-right</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-list-item @click=signOut() v-ripple>
            <v-list-item-avatar>
              <v-icon class="grey lighten-2 secondary--text" >mdi-logout</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon>
                <v-icon color="secondary">mdi-chevron-right</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          
        </v-list>
        <!-- Test check out -->
        <v-list subheader>
          <v-list-item @click=checkOut()  v-ripple>
            <v-list-item-avatar>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title >Check out</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-btn icon>
                <v-icon color="secondary">mdi-chevron-right</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>

      </v-tab-item>
      <v-tab-item>
        <v-list subheader>
          <v-list-item @click=removeAccount()  v-ripple>
            <v-list-item-avatar class="grey lighten-2 secondary--text">
              <v-icon>mdi-account-remove</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title >Remove Account</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon>
                <v-icon color="secondary">mdi-chevron-right</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-tab-item>
    </v-tabs-items>
    <v-btn v-if="checkedIn()" @click="goToCart" fixed app color="primary" width="52px" height="52px" elevation="1" absolute dark bottom style="right: 50%; transform: translateX(50%); bottom: 30px; z-index: 100;" fab>
      <v-icon>mdi-cart-outline</v-icon>
    </v-btn>
    <NavBar></NavBar>
  </v-container>

</template>

<script>
import NavBar from '@/components/layout/NavBar';
import store from '@/store/store.js';
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ImageInput from '../../components/imageUploader/imageInput.vue'

export default {
  data: () => ({
    items: [
      // { icon: 'mdi-bell', iconClass: 'grey lighten-2 secondary--text', title: 'Notifications', route: '', },
      // { icon: 'mdi-format-list-bulleted', iconClass: 'grey lighten-2 secondary--text', title: 'Order History', route: '', },
      { icon: 'mdi-theme-light-dark', iconClass: 'grey lighten-2 secondary--text', title: 'Theme Settings', route: '', },
      { icon: 'mdi-credit-card-outline', iconClass: 'grey lighten-2 secondary--text', title: 'Payment Information', route: '', },
      { icon: 'mdi-logout', iconClass: 'grey lighten-2 secondary--text', title: 'Logout', route: '', },
    ],
    tab: null,
    avatar: null,
    saving: false,
    saved: false
  }),
  components: {
    'NavBar': NavBar,
    ImageInput: ImageInput
  },
  watch:{
    avatar: {
      handler: function() {
        this.saved = false
      },
      deep: true
    }
  },
  methods: {
    signOut () {
      this.reset
      this.$router.push('/login')
    },
    backNavigation () {
      this.$router.back()
    },
    uploadImage() {
      this.saving = true
      setTimeout(() => this.savedAvatar(), 1000)
    },
    savedAvatar() {
      // await save image
      this.saving = false
      this.saved = true
    },
    darkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    mounted() {
      if (this.customerInfo.theme == 'light') {
        this.darkMode = false
      } else if (this.customerInfo.theme = 'dark') {
        this.darkMode = true
      }
    },
    async checkOut() {
      await this.checkout
      await this.setCheckedInQRCode (null)
      await this.setCheckedInRestaurantId (null)
      await this.setCheckedInTableId (null)
      this.$router.push('/')
    },
    ...mapMutations({
      setCheckedInQRCode : 'CustomerStore/SET_CHECKED_IN_CODE',
      setCheckedInRestaurantId : 'CustomerStore/SET_CHECKED_IN_RESTAURANT_ID',
      setCheckedInTableId : 'CustomerStore/SET_CHECKED_IN_TABLE_ID',
    }),
    checkedIn() {
      let checkedInVal = this.checkedInQRCode;
      let checkedInRestaurantId = this.checkedInRestaurantId;

      if (checkedInVal != null && checkedInRestaurantId != null) {
        return true;
      } else {
        return false;
      }
    },
    goToCart() {
      this.$router.push('/cart')
    },
  },
  computed: {
    ...mapGetters({
      customerInfo: 'CustomerStore/getCustomerProfile',
      checkedInQRCode: 'CustomerStore/getCheckedInQRCode',
      checkedInRestaurantId: 'CustomerStore/getCheckedInRestaurantId',
    }),
    ...mapActions({
      loadCustomer: 'CustomerStore/loadCustomer',
      checkout: 'CustomerStore/checkOutCustomer', 
    }),
    
  }
}
</script>