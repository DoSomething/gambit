'use strict';

const broadcastsIndexRoute = require('./broadcasts/index');
const broadcastsSingleRoute = require('./broadcasts/single');
const mongooseRoutes = require('./mongoose');
const broadcastMessagesRoute = require('./messages/broadcast');
const frontMessagesRoute = require('./messages/front');
const memberMessagesRoute = require('./messages/member');
const signupMessagesRoute = require('./messages/signup');
// To be deprecated:
const importMessageRoute = require('./import-message');

// middleware
const authenticateMiddleware = require('../../lib/middleware/authenticate');
const parseMessageMetadataMiddleware = require('../../lib/middleware/messages/metadata-parse');

module.exports = function init(app) {
  app.get('/', (req, res) => res.send('hi'));
  app.get('/favicon.ico', (req, res) => res.sendStatus(204));

  // authenticate all requests
  app.use(authenticateMiddleware());

  // restified routes
  app.use(mongooseRoutes);

  // broadcasts-single route
  app.use('/api/v1/broadcasts/:broadcastId',
    broadcastsSingleRoute);
  // broadcasts-index route
  app.use('/api/v1/broadcasts',
    broadcastsIndexRoute);

  // parse metadata like requestId and retryCount for all requests after this line
  app.use(parseMessageMetadataMiddleware());

  // v1
  app.use('/api/v1/import-message',
    importMessageRoute);

  app.use('/api/v2/messages', (req, res, next) => {
    const origin = req.query.origin;
    if (origin === 'broadcast') {
      broadcastMessagesRoute(req, res, next);
    } else if (origin === 'front') {
      frontMessagesRoute(req, res, next);
    } else if (origin === 'signup') {
      signupMessagesRoute(req, res, next);
    } else {
      memberMessagesRoute(req, res, next);
    }
  });
};
