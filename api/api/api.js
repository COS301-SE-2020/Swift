const express = require('express');
const adminController = require('./controller/adminController');
const authController = require('./controller/authController');
const restaurantController = require('./controller/restaurantController');
const restaurantAdminController = require('./controller/restaurantAdminController');
const userController = require('./controller/userController');
const healthCheck = require('./helper/healthCheck');

const router = express.Router();

// Handle DELETE request
router.delete('/', (req, res) => {
  const jsonResponse = {
    whoami: 'Swift API :)',
  };
  res.status(200).send(jsonResponse);
});

// Handle GET request
router.get('/', (req, res) => {
  const jsonResponse = {
    whoami: 'Swift API :)',
  };
  res.status(200).send(jsonResponse);
});

// Health Check
router.get('/status', (req, res) => healthCheck.getServiceStatus(res));

// Facebook OAUTH2
router.get('/auth/facebook', (req, res) => authController.handleFacebookCallback(req.query, res));
router.post('/auth/facebook', (req, res) => authController.handleFacebookCallbackPost(req.body, res));

// Google OAUTH2
router.get('/auth/google', (req, res) => authController.handleGoogleCallback(req.query, res));

// Handle POST request
router.post('/', (req, res) => {
  try {
    // Handle variable request types
    switch (req.body.requestType) {
      case 'register': {
        userController.registerUser(req.body, res);
        break;
      }
      case 'login': {
        userController.loginUser(req.body, res);
        break;
      }
      case 'reset': { //  for the reset password
        userController.resetPassword(req.body, res);
        break;
      }
      case 'verify': {
        userController.verifyToken(req.body, res);
        break;
      }
      case 'updatePassword': {
        userController.updatePassword(req.body, res);
        break;
      }
      case 'loginAdmin': {
        adminController.loginAdmin(req.body, res);
        break;
      }
      case 'loginFacebook': {
        authController.getFacebookLoginURL(req.body, res);
        break;
      }
      case 'loginGoogle': {
        authController.getGoogleLoginURL(req.body, res);
        break;
      }
      case 'refresh': {
        userController.refreshToken(req.body, res);
        break;
      }
      case 'addFavourite': {
        userController.addFavourite(req.body, res);
        break;
      }
      case 'removeFavourite': {
        userController.removeFavourite(req.body, res);
        break;
      }
      case 'allRestaurants': {
        restaurantController.getRestaurantList(req.body, res);
        break;
      }
      case 'allRestaurantCategories': {
        restaurantController.getRestaurantCategories(req.body, res);
        break;
      }
      case 'listAdminRestaurants': {
        restaurantAdminController.getRestaurantList(req.body, res);
        break;
      }
      case 'createRestaurant': {
        restaurantAdminController.createRestaurant(req.body, res);
        break;
      }
      case 'checkin': {
        restaurantController.checkIn(req.body, res);
        break;
      }
      case 'checkout': {
        restaurantController.checkOut(req.body, res);
        break;
      }
      case 'restaurantMenu': {
        restaurantController.getMenu(req.body, res);
        break;
      }
      case 'createTable': {
        restaurantAdminController.createTable(req.body, res);
        break;
      }
      case 'getTableQR': {
        restaurantController.getTableQRCode(req.body, res);
        break;
      }
      case 'getTableStatus': {
        restaurantAdminController.getTableStatus(req.body, res);
        break;
      }
      case 'addOrder': {
        restaurantController.addOrder(req.body, res);
        break;
      }
      case 'listOrders': {
        restaurantController.listOrders(req.body, res);
        break;
      }
      case 'orderStatusUpdate': {
        restaurantAdminController.updateOrderStatus(req.body, res);
        break;
      }
      case 'orderStatus': {
        restaurantController.getOrderStatus(req.body, res);
        break;
      }
      case 'payment': {
        restaurantController.orderPayment(req.body, res);
        break;
      }
      case 'addReview': {
        restaurantController.addReview(req.body, res);
        break;
      }
      case 'ratingPhrases': {
        restaurantController.getRatingPhrases(req.body, res);
        break;
      }
      default: {
        res.status(400).send({ status: 400, reason: 'Bad Request' });
      }
    }
  } catch (err) {
    // invalid request body, not in json format
    console.error('API Error [Post - Controller Router]', err.stack);
    res.status(500).send({ status: 500, reason: 'Internal Server Error' });
  }
});

// Handle PUT request
router.put('/', (req, res) => {
  const jsonResponse = {
    whoami: 'Swift API :)',
  };
  res.status(200).send(jsonResponse);
});

// Callback
module.exports = router;
