'use strict'

const bcrypt = require('bcrypt');
const db = require('./db');
const validator = require("email-validator");
const { response } = require('express');

module.exports = {
    loginUser : (reqBody, response) => {
        var jsonResponse = {'request':'POST', 'response':'Login -> Swift API :)'};
        response.status(200).send(jsonResponse);


    },
    registerUser : (reqBody, response) => {
        // Check all keys are in place - no need to check request type at this point
        if(!reqBody.hasOwnProperty("name") || !reqBody.hasOwnProperty("surname") ||
            !reqBody.hasOwnProperty("username") ||!reqBody.hasOwnProperty("email") ||
            !reqBody.hasOwnProperty("password")) {
            return response.status(400).send({'status':400,'reason':'Bad Request'});
        }

        var firstname = reqBody.name;
        var surname = reqBody.surname;
        var username = reqBody.username;
        var useremail = reqBody.email;
        var password = bcrypt.hashSync(reqBody.password, 10); // Hash password
        var userTheme = 'Light'; // Default light theme

        // TODO: Remove hardcoded token
        var userToken = '728b540dae2a49b5f7f752a8b84037fb1';

        // Check that email is valid
        if(!validator.validate(useremail)) {
            // invalid email
            return response.status(400).send({'status':403,'reason':'Invalid Email'});
        }
        
        // check if user exists first - be careful of SQL injection
        db.query('SELECT user FROM public.customer WHERE username = $1::text OR email = $2::text', [username, useremail]).then(res => {
            if(res.rows.length > 0) {
                // user exists
                return response.status(409).send({'status':409,'reason':'Customer Already Exists'});
            } else {
                // create new account
                db.query('INSERT INTO public.customer (name, surname, email, username, password, theme) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::text);', [firstname, surname, useremail, username, password, userTheme]).then(res => {
                    // success
                    return response.status(201).send({'token': userToken});
                }).catch(err => {
                    console.error('Error executing query', err.stack)
                    return response.status(400).send({'status':500,'reason':'Internal Server Error'});
                });
            }
        }).catch(err => {
            console.error('Error executing query', err.stack)
            return response.status(400).send({'status':500,'reason':'Internal Server Error'});
        });
    }
};
