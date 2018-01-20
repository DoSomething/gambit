'use strict';

const broadcastsIndexRoute = require('./broadcasts/index');
const broadcastsSingleRoute = require('./broadcasts/single');
const mongooseRoutes = require('./mongoose');
// v1
const importMessageRoute = require('./import-message');
const receiveMessageRoute = require('./receive-message');
// v2
const agentMessagesRoute = require('./messages/agent');
const broadcastMessagesRoute = require('./messages/broadcast');
const signupMessagesRoute = require('./messages/signup');

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
    signupMessagesRoute);
  // import-message route
  app.use('/api/v1/import-message',
    importMessageRoute);
  // broadcasts-single route
  app.use('/api/v1/broadcasts/:broadcastId',
    broadcastsSingleRoute);
  // broadcasts-index route
  app.use('/api/v1/broadcasts',
    broadcastsIndexRoute);

  app.use('/api/v2/messages', (req, res, next) => {
    const origin = req.query.origin;
    if (origin === 'broadcast') {
      broadcastMessagesRoute(req, res, next);
    } else if (origin === 'agent') {
      agentMessagesRoute(req, res, next);
    } else {
      res.status(403).send('Missing origin query parameter.');
    }
  });
};
