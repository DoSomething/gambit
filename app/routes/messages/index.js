'use strict';

const express = require('express');

const router = express.Router();

const analyticsHelper = require('../../../lib/helpers/analytics');
const broadcastMessagesRoute = require('./broadcast');
const frontMessagesRoute = require('./front');
const memberMessagesRoute = require('./member');
const signupMessagesRoute = require('./signup');

// Middleware
const { middleware: statusParamsMiddleware } = require('../../../lib/middleware/messages/status/params');
const { middleware: messageUpdateMiddleware } = require('../../../lib/middleware/messages/message-update');

router.patch('/:messageId',
  statusParamsMiddleware(),
  messageUpdateMiddleware(),
  /* TODO: Update user if req.undeliverableError is true */
  (req, res) => res.sendStatus(204));

router.post('/', (req, res, next) => {
  const origin = req.query.origin;
  analyticsHelper.addCustomAttributes({ origin });
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

module.exports = router;
