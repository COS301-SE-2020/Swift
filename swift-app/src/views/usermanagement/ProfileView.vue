<template>
  <v-card flat max-width="600" class="mx-auto">
    <v-img src="https://cdn.vuetifyjs.com/images/lists/ali.png" height="250px" >
      <v-row class="fill-height">
        <v-card-title>
          <v-btn width="30px" height="30px" @click="backNavigation" color="secondary" absolute small fab style="top: 10px; left: 10px;">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
           <v-btn width="30px" height="30px" @click="editProfile" color="secondary" absolute small fab style="top: 10px; right: 10px;">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-title class="white--text pl-12 pt-12">
          <div class="display-1 pl-12 pt-12">{{customerInfo.username}}</div>
        </v-card-title>
      </v-row>
    </v-img>

    <v-tabs height="60px" v-model="tab" background-color="white" grow>
      <v-tab>
        Profile Info
      </v-tab>
      <v-tab>
        General Settings
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-list subheader>
          <v-list-item @click=signOut(item.title) v-for="item in items" :key="item.title" v-ripple>
            <v-list-item-avatar>
              <v-icon :class="[item.iconClass]" v-text="item.icon"></v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
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
        <v-card flat>
          <v-card-text>No settings yet</v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>

    <NavBar></NavBar>
  </v-card>
  <!-- <div class="profile">
    <h1>Profile</h1>
    <p>name: {{customerProfile.name}}</p>
    <p>username: {{customerProfile.username}}</p>
    <p>email: {{customerProfile.email}}</p>
    <v-btn @click=populateCustomer>Load Profile</v-btn>
    <v-btn @click=signOut>Sign Out</v-btn>
    <NavBar></NavBar>
  </div> -->

</template>

<script>
import NavBar from '@/components/layout/NavBar';
import store from '@/store/store.js';
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  data: () => ({
    items: [
      { icon: 'mdi-bell', iconClass: 'grey lighten-2 secondary--text', title: 'Notifications', route: '', },
      { icon: 'mdi-format-list-bulleted', iconClass: 'grey lighten-2 secondary--text', title: 'Order History', route: '', },
      { icon: 'mdi-theme-light-dark', iconClass: 'grey lighten-2 secondary--text', title: 'Theme Settings', route: '', },
      { icon: 'mdi-credit-card-outline', iconClass: 'grey lighten-2 secondary--text', title: 'Payment Information', route: '', },
      { icon: 'mdi-logout', iconClass: 'grey lighten-2 secondary--text', title: 'Logout', route: '', },
    ],
    tab: null,
  }),
  components: {
    'NavBar': NavBar
  },
  methods: {
    signOut (title) {
      if (title == 'Logout') {
        this.reset
        this.$router.push('/login')
      }
    },
    backNavigation () {
      this.$router.back()
    },
    editProfile () {
    },
    checkOut() {
      this.setCheckedInStatus(false)
      this.$router.push('/')
    },
    ...mapMutations({
      setCheckedInStatus : 'CustomerStore/SET_CHECKED_IN_STATUS',
    }),
  },
  computed: {
    ...mapGetters({
      customerInfo: 'CustomerStore/getCustomerProfile',
    }),
    ...mapActions({
      loadCustomer: 'CustomerStore/loadCustomer',
      reset: 'CustomerStore/reset', 
    }),
    
  }
}
</script>