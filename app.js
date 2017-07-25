'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
// parse application/json Content-Type
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded Content-Type
app.use(bodyParser.urlencoded({ extended: true }));
// require all routes
require('./app/routes')(app);

module.exports = app;
