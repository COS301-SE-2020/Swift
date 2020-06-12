'use strict'

const db = require('./db');
const { response } = require('express');

module.exports = {
    getResturantList : (token, response) => {
        var jsonResponse = {'request':'POST', 'response':'Get All resturants -> Swift API :)'};
        response.status(200).send(jsonResponse);


    },
    getMenu : (token, menuID, response) => {
        console.log(reqBody);
        var jsonResponse = {'request':'POST', 'response':'Get Menu -> Swift API :)'};
        response.status(200).send(jsonResponse);
    },
    addOrder : (token, orderInfo, response) => {
        console.log(reqBody);
        var jsonResponse = {'request':'POST', 'response':'addOrder -> Swift API :)'};
        response.status(200).send(jsonResponse);
    }

    /*
    db.query('SELECT * FROM public.customer ORDER BY userid ASC', (err, result) => {
        if (err) {
            return console.error('Error executing query', err.stack)
        }
        console.log(result.rows[0].name);
        console.log(result.rows[1].name);
    });
    */
};
