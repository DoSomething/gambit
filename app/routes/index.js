'use strict';

const chatbotRoute = require('./chatbot');

module.exports = function init(app) {
  app.get('/', (req, res) => {
    res.send('hi');
  });
  app.use('/api/v1/chatbot', chatbotRoute);
};
