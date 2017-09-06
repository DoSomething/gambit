'use strict';

const receiveMessageRoute = require('./receive-message');
const sendMessageRoute = require('./send-message');
const importMessageRoute = require('./import-message');

// middleware
const authenticateMiddleware = require('../../lib/middleware/authenticate');
const parseMetadataMiddleware = require('../../lib/middleware/metadata-parse');

module.exports = function init(app) {
  app.get('/', (req, res) => {
    res.send('hi');
  });

  // authenticate all requests after this line
  app.use(authenticateMiddleware());

  // parse metadata like requestId and retryCount for all requests after this line
  app.use(parseMetadataMiddleware());

  app.use('/api/v1/receive-message',
    receiveMessageRoute);
  app.use('/api/v1/send-message',
    sendMessageRoute);
  app.use('/api/v1/import-message',
    importMessageRoute);
};
