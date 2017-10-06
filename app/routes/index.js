'use strict';

const express = require('express');
const restify = require('express-restify-mongoose');
const receiveMessageRoute = require('./receive-message');
const sendMessageRoute = require('./send-message');
const importMessageRoute = require('./import-message');
const broadcastSettingsRoute = require('./broadcast-settings');

// middleware
const authenticateMiddleware = require('../../lib/middleware/authenticate');
const parseMetadataMiddleware = require('../../lib/middleware/metadata-parse');

const router = express.Router();

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Campaign = require('../models/Campaign');

restify.serve(router, Conversation, { name: 'conversations' });
restify.serve(router, Message, { name: 'messages' });
restify.serve(router, Campaign, { name: 'campaigns' });

module.exports = function init(app) {
  app.get('/', (req, res) => res.send('hi'));
  app.get('/favicon.ico', (req, res) => res.sendStatus(204));

  // TODO: Eventually remove this.
  // @see https://github.com/DoSomething/gambit-conversations/issues/55
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    return next();
  });
  // restified routes
  app.use(router);
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
