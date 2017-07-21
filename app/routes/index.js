'use strict';

const receiveMessageRoute = require('./receive-message');
const sendMessageRoute = require('./send-message');

module.exports = function init(app) {
  app.get('/', (req, res) => {
    res.send('hi');
  });
  app.use('/api/v1/receive-message', receiveMessageRoute);
  app.use('/api/v1/send-message', sendMessageRoute);
};
