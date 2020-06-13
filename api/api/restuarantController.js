'use strict'

const db = require('./db');
const tokenHandler = require('./tokenHandler');
const { response } = require('express');

module.exports = {
    getResturantList : (reqBody, response) => {
        // Check all keys are in place - no need to check request type at this point
        if(!reqBody.hasOwnProperty("token")) {
            return response.status(400).send({'status':400,'reason':'Bad Request'});
        }

        // TODO: Remove hardcoded restaurant rating
        const restaurantRating = 4;

        if(tokenHandler.validate(reqBody.token)) {
            db.query('SELECT restaurantid, restaurantname, location, coverimageurl from public.restaurant;').then(res => {
                var restaurantResponse = new Object();
                restaurantResponse.restaurants = [];
                for(var r = 0; r < res.rows.length; r++) {
                    restaurantResponse.restaurants[r] = new Object();
                    restaurantResponse.restaurants[r].restaurantId = res.rows[r].restaurantid;
                    restaurantResponse.restaurants[r].name = res.rows[r].restaurantname;
                    restaurantResponse.restaurants[r].location = res.rows[r].location;
                    restaurantResponse.restaurants[r].image = res.rows[r].coverimageurl;
                    restaurantResponse.restaurants[r].rating = restaurantRating;
                }

                return response.status(200).send(restaurantResponse);
            }).catch(err => {
                console.error('Error executing query', err.stack)
                return response.status(400).send({'status':500,'reason':'Internal Server Error'});
            });
        } else {
            // Invalid token
            return response.status(401).send({'status':401,'reason':'Unauthorised Access'});
        }
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
};
