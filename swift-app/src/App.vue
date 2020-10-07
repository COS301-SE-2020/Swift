<template>
  <v-app>
    <v-main v-if="isMobile">
      <router-view></router-view>
    </v-main>
    <v-main style="width: 20%; margin: auto;" v-if="!isMobile">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    isMobile: false,
  }),
  beforeDestroy () {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize, { passive: true })
    }
  },
  mounted () {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  },

  methods: {
    onResize () {
      this.isMobile = window.innerWidth < 600
    },
  },
};
</script>

<style> 
* {
  text-transform: none !important;
}
</style>

 