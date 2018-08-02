'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express();
/**
 * Set app locals
 * @see https://expressjs.com/en/4x/api.html#app.locals
 */
app.locals.forceHttps = config.forceHttps;

// parse application/json Content-Type
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded Content-Type
app.use(bodyParser.urlencoded({ extended: true }));
// require all routes
require('./app/routes')(app);

module.exports = app;
