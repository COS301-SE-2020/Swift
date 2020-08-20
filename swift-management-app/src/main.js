import Vue from 'vue'
import App from './App.vue'
import Vuesax from 'vuesax'
import 'material-icons/iconfont/material-icons.css'
import 'vuesax/dist/vuesax.css';
Vue.use(Vuesax)

import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)

import axios from "./axios.js"
Vue.prototype.$http = axios


import '../baseConfig.js'
import './globalComponents.js'
import './assets/scss/main.scss'
import '@/assets/css/main.css'
import router from './router'
import store from './store/store'

import {
  VueHammer
} from 'vue2-hammer'
Vue.use(VueHammer)

import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

require('./assets/css/iconfont.css')

Vue.config.productionTip = false

Vue.mixin({
  methods: {
    getAuthToken() {
      if (localStorage.getItem('authToken') != "null") {
        return localStorage.getItem('authToken');
      } else {
        this.$router.push('/login');
        return null;
      }
    },
    getCurrentRestaurantId() {
      if (localStorage.getItem('currentRestaurantId') != "null") {
        return localStorage.getItem('currentRestaurantId');
      } else {
        //   this.$router.push('/mybusiness');
        return null;
      }
    },
    getCurrentRestaurantName() {
      if (localStorage.getItem('currentRestaurantName') != "null") {
        return localStorage.getItem('currentRestaurantName');
      } else {
        //   this.$router.push('/mybusiness');
        return null;
      }
    },
    checkNoRestaurantsCreated() {
      if (this.getCurrentRestaurantId() == null) {
        this.$vs.notify({
          time: 6000,
          title: "You need to create at least one Restaurant first",
          text: "You'll need to create a restaurant before we can add things to it :-)",
          color: "warning",
        });
        this.$router.push("/mybusiness");
      }
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')