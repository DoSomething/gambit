'use strict';

const broadcastsSingleRoute = require('./broadcasts/single');
const mongooseRoutes = require('./mongoose');
const rivescriptRoute = require('./rivescript');
const usersRoute = require('./users');
const v2MessagesRoute = require('./messages');

// middleware
const enforceHttpsMiddleware = require('../../lib/middleware/enforce-https');
const authenticateMiddleware = require('../../lib/middleware/authenticate');
const parseMessageMetadataMiddleware = require('../../lib/middleware/messages/metadata-parse');

module.exports = function init(app) {
  // Enforce https
  app.use(enforceHttpsMiddleware(app.locals.forceHttps));

  app.get('/', (req, res) => res.send('hi'));
  app.get('/favicon.ico', (req, res) => res.sendStatus(204));

  // authenticate all requests
  app.use(authenticateMiddleware());

  // v1
  // Restified routes.
  app.use(mongooseRoutes);
  // v2
  app.use('/api/v2/broadcasts/:broadcastId', broadcastsSingleRoute);
  app.use('/api/v2/messages',
    /**
     * parses Metadata like requestId and retryCount
     * TODO: We should split parsing X-Request-Id and X-Blink-Retry-Count
     * to a different middleware. That mw should intercept ALL requests, not just /messages.
     */
    parseMessageMetadataMiddleware(),
    v2MessagesRoute);
  app.use('/api/v2/rivescript', rivescriptRoute);
  // Route to anonymize a member's PII (Personally identifiable information) in Gambit
  app.use('/api/v2/users/:id', usersRoute);
};
