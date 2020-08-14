import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store.js'
import vuetify from './plugins/vuetify';
import ionicVue from '@ionic/vue';
import VueQrcodeReader from "vue-qrcode-reader";
import GoogleAuth from './config/google_oAuth.js'

const gauthOption = {
  clientId: '415163052147-np5h380l61kp40l50eqk5qqgh3t3ku2r.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account'
}

Vue.use(GoogleAuth, gauthOption)

Vue.use(VueQrcodeReader);

Vue.config.productionTip = false
Vue.use(ionicVue);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
