<template>
  <v-card flat height="70px">
    <v-toolbar >
      <v-toolbar-title class="ml-16 mr-10 swift-title" @click="goToHome" style="font-size: 26px;">Swift</v-toolbar-title>
      <v-btn  v-for="link in links" class="align-center nav-btn" color="white" :key="link.text" router :to="link.route" min-height="56px">
        <v-icon color="secondary">{{ link.icon }}</v-icon>
        <span class="pl-1 nav-link-item">{{ link.text }}</span>
      </v-btn>
      <v-spacer></v-spacer>
    </v-toolbar>
  </v-card>
</template>

<script>
  export default {
    data() {
      return {
        links: [
          { icon: 'mdi-home-variant-outline', text: 'Explore', route: '/' },
          { icon: 'mdi-file-document-outline', text: 'Orders', route: '/orders' },
          { icon: 'mdi-heart-outline', text: 'Favourites', route: '/favourites' },
          { icon: 'mdi-account-outline', text: 'Profile', route: '/profile' }
        ]
      };
    },
    methods: {
      goToHome () {
        this.$router.push("/");
      },
    }
  }
</script>
<style scoped>
.nav-btn {
  border: none;
  outline: none;
  box-shadow: none;
}

.nav-btn:focus {
  border: none;
}

/* .nav-link-item {
  color: #F75564;
} */

.nav-link-item:hover {
  border-bottom: 2px solid #F75564;
}

.swift-title:hover {
  cursor: pointer;
}

</style>
