'use strict';

const receiveMessageRoute = require('./receive-message');
const sendMessageRoute = require('./send-message');

// middleware
const authenticateMiddleware = require('../../lib/middleware/authenticate');

module.exports = function init(app) {
  app.get('/', (req, res) => {
    res.send('hi');
  });
  app.use('/api/v1/receive-message',
    authenticateMiddleware(),
    receiveMessageRoute);
  app.use('/api/v1/send-message',
    authenticateMiddleware(),
    sendMessageRoute);
};
