'use strict'

const express = require('express');
const router = express.Router();

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
    var jsonResponse = {'request':'POST', 'response':'POST -> Swift API :)','user_agent':req.headers['user-agent']};
    res.status(200).send(jsonResponse);
});

// Handle PUT request
router.put('/', (req, res) => {
    var jsonResponse = {'request':'PUT', 'response':'PUT -> Swift API :)','user_agent':req.headers['user-agent']};
    res.status(200).send(jsonResponse);
});

// Callback
module.exports = router;
