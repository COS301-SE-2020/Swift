const ejs = require('ejs');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const config = require('../../config/config-email.json');

// mailgun authentication details
const mgAuth = {
  auth: {
    api_key: process.env.MG_API_KEY || config.apiKey,
    domain: process.env.MG_DOMAIN_FROM || config.domainFrom
  }
};

// connect to mailgun API
const apiTransporter = nodemailer.createTransport(mg(mgAuth));

/** *****Registration Email ******** */
// eslint-disable-next-line no-unused-vars
module.exports.registrationEmail = (req, res) => {
  ejs.renderFile(`${__dirname}/RegistrationTemp.ejs`, { name: req.name }, (err, data) => {
    const mailOptions = {
      from: process.env.MG_EMAIL_FROM || config.emailFrom,
      to: req.email,
      subject: 'Swift-app Account Activated',
      html: data
    };
    apiTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`error occurs : ${error}`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Email successfully sent to: ${info.response}`);
      }
    });
  });
};

/** *****Payment Email ******** */
// eslint-disable-next-line no-unused-vars
module.exports.paymentEmail = (req, res) => {
  const { orderId } = req;
  // const order= req.details;
  const tip = req.waiterTip;
  const tax = req.orderTax;
  const total = req.orderTotal;
  const { name } = req;
  const amount = req.amountPaid;
  const { paymentMethod } = req;

  ejs.renderFile(`${__dirname}/PaymentEmail.ejs`, {
    orderId, name, tip, tax, total, amount, paymentMethod
  }, (err, data) => {
    const mailOptions = {
      from: process.env.MG_EMAIL_FROM || config.emailFrom,
      to: req.email,
      subject: 'Swift-app Payment Reciept',
      // text: 'Congratulations you have successfully registered ',
      html: data
    };

    apiTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`error occurs : ${error}`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Email successfully sent to: ${info.response}`);
      }
    });
  });
};
