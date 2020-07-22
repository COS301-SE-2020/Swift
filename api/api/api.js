const express = require('express');
const adminController = require('./controller/adminController');
const restaurantController = require('./controller/restaurantController');
const userController = require('./controller/userController');

const router = express.Router();

// Handle DELETE request
router.delete('/', (req, res) => {
  const jsonResponse = {
    request: 'DELETE',
    response: 'DELETE -> Swift API :)',
    user_agent: req.headers['user-agent']
  };
  res.status(200).send(jsonResponse);
});

// Handle GET request
router.get('/', (req, res) => {
  const jsonResponse = {
    request: 'GET',
    response: 'GET -> Swift API :)',
    user_agent: req.headers['user-agent']
  };
  res.status(200).send(jsonResponse);
});

// Handle POST request
router.post('/', (req, res) => {
  try {
    // Handle variable request types
    switch (req.body.requestType) {
      case 'register': {
        userController.registerUser(req.body, res);
        break;
      }
      case 'registerAdmin': {
        adminController.registerAdmin(req.body, res);
        break;
      }
      case 'login': {
        userController.loginUser(req.body, res);
        break;
      }
      case 'loginAdmin': {
        adminController.loginAdmin(req.body, res);
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
      case 'createRestaurant': {
        restaurantController.createRestaurant(req.body, res);
        break;
      }
      case 'checkin': {
        restaurantController.checkIn(req.body, res);
        break;
      }
      case 'restaurantMenu': {
        restaurantController.getMenu(req.body, res);
        break;
      }
      case 'createTable': {
        restaurantController.createTable(req.body, res);
        break;
      }
      case 'getTableQR': {
        restaurantController.getTableQRCode(req.body, res);
        break;
      }
      case 'getTableStatus': {
        restaurantController.getTableStatus(req.body, res);
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
        restaurantController.updateOrderStatus(req.body, res);
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
    request: 'PUT',
    response: 'PUT -> Swift API :)',
    user_agent: req.headers['user-agent']
  };
  res.status(200).send(jsonResponse);
});

// Callback
module.exports = router;
