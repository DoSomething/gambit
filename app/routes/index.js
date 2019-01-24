'use strict';

const broadcastsSingleRoute = require('./broadcasts/single');
const mongooseRoutes = require('./mongoose');
const rivescriptRoute = require('./rivescript');
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
  app.use('/api/v2/broadcasts/:broadcastId',
    broadcastsSingleRoute);
  app.use('/api/v2/messages',
    /**
     * parses Metadata like requestId and retryCount
     * TODO: We should split parsing X-Request-Id, X-Blink-Retry-Count, and X-Failure-Injection-Test
     * to a different middleware. That mw should intercept ALL requests, not just /messages.
     */
    parseMessageMetadataMiddleware(),
    v2MessagesRoute);
  app.use('/api/v2/rivescript',
    rivescriptRoute);
};
