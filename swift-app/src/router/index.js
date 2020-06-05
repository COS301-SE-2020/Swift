import Vue from 'vue'
import VueRouter from 'vue-router'
import MenuHomeView from '../views/MenuHomeView.vue'
import OrdersView from '../views/OrdersView.vue'
import FavouritesView from '../views/FavouritesView.vue'
import ProfileView from '../views/ProfileView.vue'
import CheckInView from '../views/CheckInView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import MenuItemView from '../views/MenuItemView.vue'

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
