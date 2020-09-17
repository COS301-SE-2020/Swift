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
        <v-avatar height="120" width="120" v-ripple v-if="!avatar"  class="grey lighten-3 mb-3">
          <v-img :src="customerInfo.profileimageurl" cover alt="avatar"></v-img>
        </v-avatar>
        
      </v-col>
    </v-row>
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
          <v-list-item  v-ripple>
            <v-list-item-avatar>
              <v-icon class="grey lighten-2 secondary--text" >mdi-theme-light-dark</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>Dark Mode</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon>
                <v-switch @click="darkModeUpdate" color="secondary" :input-value="darkMode" hide-details></v-switch>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-list-item @click=profilePaymentInformation() v-ripple>
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
import PictureInput from 'vue-picture-input'

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
    saved: false,
    darkMode: null,
    photo: null,
    image: ''
  }),
  components: {
    'NavBar': NavBar,
    PictureInput
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
    profilePaymentInformation() {
      this.$router.push('/profilePaymentInformation')
    },
    selectFile(event) {
      // `files` is always an array because the file input may be in multiple mode
      this.photo = event.target.files[0];
      console.log(this.photo)
    },
    onChanged() {
      console.log("New picture loaded");
      if (this.$refs.pictureInput.file) {
        this.image = this.$refs.pictureInput.file;
      } else {
        console.log("Old browser. No support for Filereader API");
      }
    },
    onRemoved() {
      this.image = '';
    },
    async attemptUpload() {

      var profileObj = {
        name: this.customerInfo.name,
        surname: this.customerInfo.surname,
        profileImage: this.image,
        theme: this.customerInfo.theme
      }

      await this.$store.dispatch('CustomerStore/editProfile', profileObj);
      
      /* if (this.image){
        FormDataPost('http://localhost:8001/user/picture', this.image)
          .then(response=>{
            if (response.data.success){
              this.image = '';
              console.log("Image uploaded successfully ✨");
            }
          })
          .catch(err=>{
            console.error(err);
          });
      } */
    },
    async darkModeUpdate() {
      this.darkMode = !this.darkMode;
      let themeSettings = ''
      if (this.darkMode === true)
       themeSettings = 'dark'
      else 
        themeSettings = 'light'

      var profileObj = {
        name: this.customerInfo.name,
        surname: this.customerInfo.surname,
        profileImage: this.customerInfo.profileimageurl,
        theme: themeSettings
      }

      await this.$store.dispatch('CustomerStore/editProfile', profileObj);

      if (this.darkMode) {
        this.$vuetify.theme.dark = true;
      } else if (!this.darkMode) {
        this.$vuetify.theme.dark = false;
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
  watch: {
    async avatar(AvatarObj) {
      // var base64Img = "data:image/jpg;base64," + btoa(AvatarObj.imageURL);

      var profileObj = {
        name: this.customerInfo.name,
        surname: this.customerInfo.surname,
        profileImage: "data:image/jpg;base64," + btoa(AvatarObj.imageFile.name),
        theme: this.customerInfo.theme
      }

      await this.$store.dispatch('CustomerStore/editProfile', profileObj);
    }
  },
  mounted() {
    if (this.customerInfo.theme === 'light') {
      this.darkMode = false
    } else if (this.customerInfo.theme === 'dark') {
      this.darkMode = true
    }
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