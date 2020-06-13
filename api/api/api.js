'use strict'

const express = require('express');
const router = express.Router();
const resturantController = require('./restuarantController');
const userController = require('./userController');

// Handle DELETE request
router.delete('/', (req, res) => {
    var jsonResponse = {'request':'DELETE', 'response':'DELETE -> Swift API :)','user_agent':req.headers['user-agent']};
    res.status(200).send(jsonResponse);
});

// Handle GET request
router.get('/', (req, res) => {
    var jsonResponse = {'request':'GET', 'response':'GET -> Swift API :)','user_agent':req.headers['user-agent']};
    res.status(200).send(jsonResponse);
});

// Handle POST request
router.post('/', (req, res) => {
    try {
        const reqBody = req.body;
        // Handle variable request types
        switch(req.body.requestType) {
            case 'register': {
                userController.registerUser(req.body, res);
                break;
            }
            case 'login': {
                userController.loginUser(req.body, res);
                break;
            }
            case 'allRestaurants': {
                resturantController.getResturantList(req.body, res);
                break;
            }
            case 'restaurantMenu': {
                resturantController.getMenu(req.body.token, req.body.restaurantId, res);
                break;
            }
            case 'addOrder': {
                resturantController.addOrder(req.body.token, req.body.orderInfo, res);
                break;
            }
            default: {
                var errResponse = {'status':400,'reason':'Bad Request'};
                res.status(400).send(errResponse);
            }
        }
    } catch (err) {
        // invalid request body, not in json format
        console.log(err); // log error
        var errResponse = {'status':'Bad Request'};
        res.status(400).send(errResponse);
    }
});

// Handle PUT request
router.put('/', (req, res) => {
    var jsonResponse = {'request':'PUT', 'response':'PUT -> Swift API :)','user_agent':req.headers['user-agent']};
    res.status(200).send(jsonResponse);
});

// Callback
module.exports = router;
