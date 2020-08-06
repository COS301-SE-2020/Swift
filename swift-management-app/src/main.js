import Vue from 'vue'
import App from './App.vue'
import Vuesax from 'vuesax'
import 'material-icons/iconfont/material-icons.css'
import 'vuesax/dist/vuesax.css';
Vue.use(Vuesax)

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

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')