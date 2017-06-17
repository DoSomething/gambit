'use strict';

const homeRoute = require('./home');

module.exports = function init(app) {
  app.get('/', homeRoute);
};
