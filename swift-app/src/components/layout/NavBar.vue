<template>
  <v-bottom-navigation app grow  color="primary" >
    <v-btn v-for="link in links" class="align-center" :key="link.text" router :to="link.route" min-height="56px">
      <span>{{ link.text }}</span>
      <v-icon color="secondary">{{ link.icon }}</v-icon>
    </v-btn>
  </v-bottom-navigation>
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
    }
  }
</script>
