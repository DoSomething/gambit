'use strict';

const broadcastsIndexRoute = require('./broadcasts/index');
const broadcastsSingleRoute = require('./broadcasts/single');
const mongooseRoutes = require('./mongoose');
const v2MessagesRoute = require('./messages');

// middleware
const authenticateMiddleware = require('../../lib/middleware/authenticate');
const parseMessageMetadataMiddleware = require('../../lib/middleware/messages/metadata-parse');

module.exports = function init(app) {
  app.get('/', (req, res) => res.send('hi'));
  app.get('/favicon.ico', (req, res) => res.sendStatus(204));

  // authenticate all requests
  app.use(authenticateMiddleware());

  // v1
  // Restified routes.
  app.use(mongooseRoutes);
  // GET broadcasts routes are prefixed with v1 to keep consistent with our v1 Mongoose routes.
  // TODO: Prefix with v2, resolve Express Mongoose Restify conflicts (or build custom GET routes).
  app.use('/api/v1/broadcasts/:broadcastId',
    broadcastsSingleRoute);
  app.use('/api/v1/broadcasts',
    broadcastsIndexRoute);

  // parse metadata like requestId and retryCount for all requests after this line
  app.use(parseMessageMetadataMiddleware());

  // v2
  app.use('/api/v2/messages', v2MessagesRoute);
};
