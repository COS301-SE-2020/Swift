var express =require('express');
const nodemailer = require('nodemailer');
//const hbs = require('nodemailer-express-handlebars');
const creds = require('./config/config');
/*******Registration Email *********/ 
module.exports.RegistrationEmail =  (req,res) =>{
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: creds.USER,
                pass: creds.PASS, 
              }
            });

            
            const ejs = require("ejs");
            ejs.renderFile(__dirname+"/RegistrationTemp.ejs", {name :req.name}, function (err,data){
            const mailOptions = {
                from: 'lumiqon.info@gmail.com',
                to: req.email, 
              subject: 'Swift-app Account Activated',
             // text: 'Congratulations you have successfully registered ',
              html: data
            };
          
          
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log('error occurs : '+error);
                } else {
                  console.log('Email successfully sent to: ' + info.response);
                }
              });
            });
          }






                               /*******Payment Email *********/   

       module.exports.PaymentEmail =  (orderId,paymentMethod,amountPaid) =>{
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: creds.USER,
            pass: creds.PASS, 
          }
        });

        
        const ejs = require("ejs");
        ejs.renderFile(__dirname+"/PaymentEmail.ejs", {order :req.name}, function (err,data){
        const mailOptions = {
            from: 'lumiqon.info@gmail.com',
            to: req.email, 
          subject: 'Swift-app Payment Reciept',
         // text: 'Congratulations you have successfully registered ',
          html: data
        };
      
      
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log('error occurs : '+error);
            } else {
              console.log('Email successfully sent to: ' + info.response);
            }
          });
        });
      }