'use strict'

const db = require('./db');
const { response } = require('express');

module.exports = {
    getResturantList : (token, response) => {
        var jsonResponse = {'request':'POST', 'response':'Get All resturants -> Swift API :)'};
        response.status(200).send(jsonResponse);
       
    db.query('SELECT * FROM restaurants WHERE restaurantId = $1',[restaurantId])   //returns the first resturant in the database
        .then(result => {
        if (!result){ response.status(409).send({'status':409, "Resturant not found"}) } else
        {
             response.status(201).send(result.row);;
        }
        })
        .catch(err => {
            console.error('Error executing query', err.stack)
            return response.status(400).send({'status':500,'reason':'Internal Server Error'});})

    },
    getMenu : (token, menuID, response) => {
        console.log(reqBody); //using reqBody when its not provided as a parameter ???????
        var jsonResponse = {'request':'POST', 'response':'Get Menu -> Swift API :)'};
        response.status(200).send(jsonResponse);
        //returns the menu with the given menuID

          db.query('SELECT * FROM users WHERE id = menuID', [menuID]) 
          .then(result => {
            if (!result){ response.status(404).send({'status':404, "Menu item not found"}) } else
            {
                 response.status(201).send(result.row);;
            }
            })
            .catch(err => {
                console.error('Error executing query', err.stack)
                return response.status(400).send({'status':500,'reason':'Internal Server Error'});
            });

    },
    addOrder : (token,orderInfo, response) => {
        console.log(reqBody);
        var jsonResponse = {'request':'POST', 'response':'addOrder -> Swift API :)'};
        response.status(200).send(jsonResponse);
        ////////////

  const order = orderInfo;

  db.query('INSERT INTO orders (order) VALUES ($1 ::orderInfo)', [orderInfo])
    .then(result => {
            if (!result){ response.status(404).send({'status':404, "Resturant not found"}) } else
            {
                 response.status(201).send(result.row);;
            }
            })
            .catch(err => {
                console.error('Error executing query', err.stack)
                return response.status(400).send({'status':500,'reason':'Internal Server Error'});
            });
        
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
