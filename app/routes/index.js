'use strict';

const receiveMessageRoute = require('./receive-message');
const sendMessageRoute = require('./send-message');
const importMessageRoute = require('./import-message');
const broadcastSettingsRoute = require('./broadcast-settings');
const mongooseRoutes = require('./mongoose');

// middleware
const authenticateMiddleware = require('../../lib/middleware/authenticate');
const parseMetadataMiddleware = require('../../lib/middleware/metadata-parse');

module.exports = function init(app) {
  app.get('/', (req, res) => res.send('hi'));
  app.get('/favicon.ico', (req, res) => res.sendStatus(204));

  // restified routes
  app.use(mongooseRoutes);
  // authenticate all requests after this line
  app.use(authenticateMiddleware());
  // parse metadata like requestId and retryCount for all requests after this line
  app.use(parseMetadataMiddleware());

  // receive-message route
  app.use('/api/v1/receive-message',
    receiveMessageRoute);
  // send-message route
  app.use('/api/v1/send-message',
    sendMessageRoute);
  // import-message route
  app.use('/api/v1/import-message',
    importMessageRoute);
  // broadcast-settings route
  app.use('/api/v1/broadcast-settings',
    broadcastSettingsRoute);
};
