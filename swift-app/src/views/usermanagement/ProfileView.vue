<template>
  <div class="profile">
    <h1>Profile</h1>
    <p>name: {{customerProfile.name}}</p>
    <p>username: {{customerProfile.username}}</p>
    <p>email: {{customerProfile.email}}</p>
    <v-btn @click=populateCustomer>Load Profile</v-btn>
    <v-btn @click=signOut>Sign Out</v-btn>
    <NavBar></NavBar>
  </div>

</template>

<script>
import NavBar from '@/components/layout/NavBar';
import store from '@/store/store.js';
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    'NavBar': NavBar
  },
  methods: {
    populateCustomer () {
      this.loadCustomer
    },
    signOut () {
      this.reset
      this.$router.push('/login')
    },
  },
  computed: {
    ...mapGetters({
      customerProfile: 'CustomerStore/getCustomerProfile',
    }),
    ...mapActions({
      loadCustomer: 'CustomerStore/loadCustomer', // loads customer the first time
      reset: 'CustomerStore/reset', 
    })
  }
}
</script>