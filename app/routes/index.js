'use strict';

const express = require('express');
const restify = require('express-restify-mongoose');
const receiveMessageRoute = require('./receive-message');
const sendMessageRoute = require('./send-message');
const importMessageRoute = require('./import-message');

// middleware
const authenticateMiddleware = require('../../lib/middleware/authenticate');

const router = express.Router();

const ConversationModel = require('../models/Conversation');
const MessageModel = require('../models/Message');
const CampaignModel = require('../models/Campaign');

restify.serve(router, ConversationModel, { name: 'conversations' });
restify.serve(router, MessageModel, { name: 'messages' });
restify.serve(router, CampaignModel, { name: 'campaigns' });

module.exports = function init(app) {
  app.get('/', (req, res) => {
    res.send('hi');
  });
  // TODO: Eventually remove this.
  // @see https://github.com/DoSomething/gambit-conversations/issues/55
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    return next();
  });
  app.use(router);
  app.use('/api/v1/receive-message',
    authenticateMiddleware(),
    receiveMessageRoute);
  app.use('/api/v1/send-message',
    authenticateMiddleware(),
    sendMessageRoute);
  app.use('/api/v1/import-message',
    authenticateMiddleware(),
    importMessageRoute);
};
