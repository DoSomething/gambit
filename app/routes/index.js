'use strict';

const chatbotRoute = require('./chatbot');
const sendMessageRoute = require('./send-message');

module.exports = function init(app) {
  app.get('/', (req, res) => {
    res.send('hi');
  });
  app.use('/api/v1/chatbot', chatbotRoute);
  app.use('/api/v1/send-message', sendMessageRoute);
};
