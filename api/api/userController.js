'use strict'

const db = require('./db');
const { response } = require('express');

module.exports = {
    loginUser : (reqBody, response) => {
        var jsonResponse = {'request':'POST', 'response':'Login -> Swift API :)'};
        response.status(200).send(jsonResponse);


    },
    registerUser : (reqBody, response) => {
        console.log(reqBody);
        var jsonResponse = {'request':'POST', 'response':'Register -> Swift API :)'};
        response.status(200).send(jsonResponse);
    }

    /*db.query('SELECT * FROM public.customer ORDER BY userid ASC', (err, result) => {
        if (err) {
            return console.error('Error executing query', err.stack)
        }
        console.log(result.rows[0].name);
        console.log(result.rows[1].name);
    });*/
};
