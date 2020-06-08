import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store.js'
import vuetify from './plugins/vuetify';
import ionicVue from '@ionic/vue';

Vue.config.productionTip = false
Vue.use(ionicVue);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
