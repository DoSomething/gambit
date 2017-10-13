'use strict';

const express = require('express');
const restify = require('express-restify-mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Campaign = require('../models/Campaign');

const router = express.Router();

const checkReqMethod = function checkReqMethod(req, res, next) {
  if (req.method !== 'GET') {
    return res.sendStatus(401);
  }
  return next();
};

const resultsHeader = 'X-Gambit-Results-Count';
const resultsLimit = 50;

restify.serve(router, Conversation, {
  limit: resultsLimit,
  name: 'conversations',
  totalCountHeader: resultsHeader,
  preMiddleware: checkReqMethod,
});
restify.serve(router, Message, {
  limit: resultsLimit,
  name: 'messages',
  totalCountHeader: resultsHeader,
  preMiddleware: checkReqMethod,
});
restify.serve(router, Campaign, {
  limit: resultsLimit,
  name: 'campaigns',
  totalCountHeader: resultsHeader,
  preMiddleware: checkReqMethod,
});

module.exports = router;
