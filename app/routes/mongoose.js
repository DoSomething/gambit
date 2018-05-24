'use strict';

const express = require('express');
const restify = require('express-restify-mongoose');
const config = require('../../config/app/routes/mongoose');

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router = express.Router();
const countHeader = config.countHeaderName;

router.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', countHeader);
  return next();
});

// @see https://florianholzapfel.github.io/express-restify-mongoose/#premiddleware
const checkReqMethod = function checkReqMethod(req, res, next) {
  if (req.method !== 'GET') {
    /**
     * Per standards
     * @see https://httpstatuses.com/405
     * @see https://tools.ietf.org/html/rfc7231#section-6.5.5
     */
    res.header('Allow', 'GET, OPTIONS');
    return res.sendStatus(405);
  }
  return next();
};

function getRestifyOptionsWithName(name) {
  return {
    limit: config.defaultLimit,
    name,
    totalCountHeader: countHeader,
    preMiddleware: checkReqMethod,
  };
}

restify.serve(router, Conversation, getRestifyOptionsWithName('conversations'));
restify.serve(router, Message, getRestifyOptionsWithName('messages'));

module.exports = router;
