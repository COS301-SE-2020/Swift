"use strict"

const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const SERVER_PORT = process.env.PORT || 3264;

// Parse JSON bodies
app.use(bodyParser.json());

// Set Lumiqon server header
app.use(function (req, res, next) {
    //res.setHeader('Server', 'Lumiqon');
    res.setHeader('X-Powered-By', 'Lumiqon');
    next();
});

// API handle requests
app.delete('/', require('./api/api'));
app.get('/', require('./api/api'));
app.post('/', require('./api/api'));
app.put('/', require('./api/api'));

// Start server
var server = app.listen(SERVER_PORT, function () {
    console.log('Server listening on port: ' + server.address().port);
});

// return object for unit testing
module.exports = server;
