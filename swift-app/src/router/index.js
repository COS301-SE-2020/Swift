import Vue from 'vue'
import VueRouter from 'vue-router'
import OrdersView from '../views/orders/OrdersView.vue'
import CartView from '../views/orders/CartView.vue'
import FavouritesView from '../views/favourites/FavouritesView.vue'
import ARView from '../views/ar/ARView.vue'

import CheckInView from '../views/home/CheckInView.vue'
import HomeView from '../views/home/HomeView.vue'

import ProfileView from '../views/usermanagement/ProfileView.vue'
import LoginView from '../views/usermanagement/LoginView.vue'
import RegisterView from '../views/usermanagement/RegisterView.vue'

import MenuHomeView from '../views/menu/MenuHomeView.vue'
import MenuItemView from '../views/menu/MenuItemView.vue'

Vue.use(VueRouter)

Vue.use(require('vue-script2'))


const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/menu', name: 'menu', component: MenuHomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/checkin', name: 'checkin', component: CheckInView },
  { path: '/orders', name: 'orders', component: OrdersView },
  { path: '/cart', name: 'cart', component: CartView },
  { path: '/favourites', name: 'favourites', component: FavouritesView },
  { path: '/ar', name: 'ar', component: ARView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/menuItem/:itemid', name: 'menuItem', component: MenuItemView },
]

const router = new VueRouter({
  routes
})

Vue.config.ignoredElements = [
  'a-scene',
  'a-entity',
  'a-camera',
  'a-box',
  'a-sky',
  'a-assets',
  'a-marker',
  'a-marker-camera',
  'a-obj-model'
]

export default router
