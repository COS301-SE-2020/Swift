import Vue from 'vue'
import VueRouter from 'vue-router'
import OrdersView from '../views/orders/OrdersView.vue'
import CartView from '../views/orders/CartView.vue'
import PaymentView from '../views/orders/PaymentView.vue'
import FavouritesView from '../views/favourites/FavouritesView.vue'

import CheckInView from '../views/home/CheckInView.vue'
import HomeView from '../views/home/HomeView.vue'

import ProfileView from '../views/usermanagement/ProfileView.vue'
import LoginView from '../views/usermanagement/LoginView.vue'
import RegisterView from '../views/usermanagement/RegisterView.vue'

import MenuHomeView from '../views/menu/MenuHomeView.vue'
import MenuItemView from '../views/menu/MenuItemView.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/menu', name: 'menu', component: MenuHomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/checkin', name: 'checkin', component: CheckInView },
  { path: '/orders', name: 'orders', component: OrdersView },
  { path: '/cart', name: 'cart', component: CartView },
  { path: '/pay', name: 'pay', component: PaymentView },
  { path: '/favourites', name: 'favourites', component: FavouritesView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/menuItem/:itemid', name: 'menuItem', component: MenuItemView },
]

const router = new VueRouter({
  routes
})

export default router
