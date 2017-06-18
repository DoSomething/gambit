'use strict';

const chatbotRoute = require('./chatbot');
const homeRoute = require('./home');

module.exports = function init(app) {
  app.get('/', homeRoute);
  app.use('/v1/chatbot', chatbotRoute);
};
