import Vue from 'vue'
import VueRouter from 'vue-router'
import OrdersView from '../views/orders/OrdersView.vue'
import FavouritesView from '../views/favourites/FavouritesView.vue'
import CheckInView from '../views/CheckInView.vue'

import ProfileView from '../views/usermanagement/ProfileView.vue'
import LoginView from '../views/usermanagement/LoginView.vue'
import RegisterView from '../views/usermanagement/RegisterView.vue'

import MenuHomeView from '../views/menu/MenuHomeView.vue'
import MenuItemView from '../views/menu/MenuItemView.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'menu', component: MenuHomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/checkin', name: 'checkin', component: CheckInView },
  { path: '/orders', name: 'orders', component: OrdersView },
  { path: '/favourites', name: 'favourites', component: FavouritesView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/menuItem/:itemid', name: 'menuItem', component: MenuItemView },
]

const router = new VueRouter({
  routes
})

export default router
