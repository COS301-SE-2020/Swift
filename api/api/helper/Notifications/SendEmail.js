var express =require('express');
const nodemailer = require('nodemailer');
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

       module.exports.PaymentEmail =  (req,res) =>{
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: creds.USER,
            pass: creds.PASS, 
          }
        });

        const orderId=req.orderId 
       // const order= req.details;
        const tip= req.waiterTip;
        const tax = req.orderTax;
        const total = req.orderTotal;
        const name =req.name;
        const amount =req.amountPaid;
        const paymentMethod= req.paymentMethod;
      
        
        
        const ejs = require("ejs");
        ejs.renderFile(__dirname+"/PaymentEmail.ejs", {orderId,name,tip,tax,total,amount,paymentMethod}, function (err,data){
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