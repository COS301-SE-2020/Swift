import Vue from 'vue'
import VueRouter from 'vue-router'
import OrdersView from '../views/orders/OrdersView.vue'
<<<<<<< HEAD
=======
import OrderHistoryView from '../views/orders/OrderHistoryView.vue'
>>>>>>> feature-notification
import RatingView from '../views/orders/RatingView.vue'
import CartView from '../views/orders/CartView.vue'

import FavouritesView from '../views/favourites/FavouritesView.vue'

import CheckInView from '../views/home/CheckInView.vue'
import ExploreView from '../views/home/ExploreView.vue'

import ProfileView from '../views/usermanagement/ProfileView.vue'
import LoginView from '../views/usermanagement/LoginView.vue'
import RegisterView from '../views/usermanagement/RegisterView.vue'
import LocationView from '../views/usermanagement/LocationView.vue'
import ForgotPasswordView from '../views/usermanagement/ForgotPasswordView.vue'
<<<<<<< HEAD
import PaymentInformationView from '../views/usermanagement/PaymentInformationView.vue'
import AddCardView from '../views/usermanagement/AddCardView.vue'

import MenuHomeView from '../views/menu/MenuHomeView.vue'
import MenuItemView from '../views/menu/MenuItemView.vue'
import NotificationsView from '../views/notifications/NotificationList.vue'
=======

import PaymentView from '../views/payment/PaymentView.vue'
import PaymentInformationView from '../views/payment/PaymentInformationView.vue'
import AddCardView from '../views/payment/AddCardView.vue'

import MenuHomeView from '../views/menu/MenuHomeView.vue'
import MenuItemView from '../views/menu/MenuItemView.vue'
// import NotificationsView from '../views/notifications/NotificationList.vue'
>>>>>>> feature-notification


Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'explore', component: ExploreView },
  { path: '/menu/:menuId', name: 'menu', component: MenuHomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/checkin', name: 'checkin', component: CheckInView },
  { path: '/orders', name: 'orders', component: OrderHistoryView },
  { path: '/cart', name: 'cart', component: CartView },
  { path: '/pay', name: 'pay', component: PaymentView },
  { path: '/favourites', name: 'favourites', component: FavouritesView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/location', name: 'location', component: LocationView },
  { path: '/menuItem/:itemid', name: 'menuItem', component: MenuItemView },
  { path: '/rating', name: 'rating', component: RatingView },
  { path: '/forgotPassword', name: 'forgotPassword', component: ForgotPasswordView },
  { path: '/paymentInformation', name: 'paymentInformation', component: PaymentInformationView },
  { path: '/addCard', name: 'addCard', component: AddCardView },
<<<<<<< HEAD
  { path: '/notifications', name: 'notifications', component: NotificationsView },
=======
  // { path: '/notifications', name: 'notifications', component: NotificationsView },
>>>>>>> feature-notification
]

const router = new VueRouter({
  routes
})

export default router
