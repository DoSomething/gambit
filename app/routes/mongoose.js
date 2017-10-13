'use strict';

const express = require('express');
const restify = require('express-restify-mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Campaign = require('../models/Campaign');

const router = express.Router();
const countHeader = 'X-Gambit-Results-Count';

router.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', countHeader);
  return next();
});

const checkReqMethod = function checkReqMethod(req, res, next) {
  if (req.method !== 'GET') {
    return res.sendStatus(401);
  }
  return next();
};

function getRestifyOptionsWithName(name) {
  return {
    limit: 50,
    name,
    totalCountHeader: countHeader,
    preMiddleware: checkReqMethod,
  };
}

restify.serve(router, Conversation, getRestifyOptionsWithName('conversations'));
restify.serve(router, Message, getRestifyOptionsWithName('messages'));
restify.serve(router, Campaign, getRestifyOptionsWithName('campaigns'));

module.exports = router;
