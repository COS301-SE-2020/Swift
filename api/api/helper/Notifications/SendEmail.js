const ejs = require('ejs');
const nodemailer = require('nodemailer');
const creds = require('../../config/config-email.json');

/** *****Registration Email ******** */
// eslint-disable-next-line no-unused-vars
module.exports.RegistrationEmail = (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || creds.usernname,
      pass: process.env.EMAIL_PASS || creds.password,
    }
  });
  ejs.renderFile(`${__dirname}/RegistrationTemp.ejs`, { name: req.name }, (err, data) => {
    const mailOptions = {
      from: 'lumiqon.info@gmail.com',
      to: req.email,
      subject: 'Swift-app Account Activated',
      html: data
    };
    transporter.sendMail(mailOptions, (error, info) => {
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
module.exports.PaymentEmail = (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || creds.usernname,
      pass: process.env.EMAIL_PASS || creds.password,
    }
  });

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
      from: 'lumiqon.info@gmail.com',
      to: req.email,
      subject: 'Swift-app Payment Reciept',
      // text: 'Congratulations you have successfully registered ',
      html: data
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`error occurs : ${error}`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Email successfully sent to: ${info.response}`);
      }
    });
  });
};
