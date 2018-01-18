'use strict';

const receiveMessageRoute = require('./receive-message');
const sendMessageRoute = require('./send-message');
const importMessageRoute = require('./import-message');
const broadcastsIndexRoute = require('./broadcasts-index');
const broadcastsSingleRoute = require('./broadcasts-single');
const mongooseRoutes = require('./mongoose');
const broadcastMessagesRoute = require('./messages/broadcast');

// middleware
const authenticateMiddleware = require('../../lib/middleware/authenticate');
const parseMetadataMiddleware = require('../../lib/middleware/metadata-parse');

module.exports = function init(app) {
  app.get('/', (req, res) => res.send('hi'));
  app.get('/favicon.ico', (req, res) => res.sendStatus(204));

  // authenticate all requests
  app.use(authenticateMiddleware());

  // restified routes
  app.use(mongooseRoutes);

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
  // broadcasts-single route
  app.use('/api/v1/broadcasts/:broadcastId',
    broadcastsSingleRoute);
  // broadcasts-index route
  app.use('/api/v1/broadcasts',
    broadcastsIndexRoute);

  // TODO: Check for origin query param. For now, use broadcastMessagesRoute.
  app.use('/api/v2/messages',
    broadcastMessagesRoute);
};
