const express = require('express');
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
      case 'login': {
        userController.loginUser(req.body, res);
        break;
      }
      case 'refresh': {
        userController.refreshToken(req.body, res);
        break;
      }
      case 'allRestaurants': {
        restaurantController.getRestaurantList(req.body, res);
        break;
      }
      case 'restaurantMenu': {
        restaurantController.getMenu(req.body, res);
        break;
      }
      case 'addOrder': {
        restaurantController.addOrder(req.body, res);
        break;
      }
      default: {
        res.status(400).send({ status: 400, reason: 'Bad Request' });
      }
    }
  } catch (err) {
    // invalid request body, not in json format
    console.error(err); // log error
    res.status(400).send({ status: 400, reason: 'Bad Request' });
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
