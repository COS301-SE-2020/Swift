const db = require('../db');

// TODO: Delete File

module.exports = {
  createCustomer: (customerData) => db.query(
    'INSERT INTO public.customer (name, surname, email, password, refreshtoken, theme)'
      + ' VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::text);',
    [
      customerData.name,
      customerData.surname,
      customerData.email,
      customerData.password,
      customerData.refreshToken,
      customerData.userTheme
    ]
  ),
  createAdmin: (adminData) => db.query(
    'INSERT INTO public.adminuser (name, surname, email, password, refreshtoken, restaurantid)'
      + ' VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::integer);',
    [
      adminData.name,
      adminData.surname,
      adminData.email,
      adminData.password,
      adminData.refreshToken,
      adminData.restaurantId
    ]
  ),
  createEmployee: (employeeData) => db.query(
    'INSERT INTO public.adminuser (name, surname, email, password, refreshtoken, employeerole, restaurantid, employeenumber)'
      + ' VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::text, $7::integer, $8::text);',
    [
      employeeData.name,
      employeeData.surname,
      employeeData.email,
      employeeData.password,
      employeeData.refreshToken,
      employeeData.employeeRole,
      employeeData.restaurantId,
      employeeData.employeeNumber
    ]
  )
};
