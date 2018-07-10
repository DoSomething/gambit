'use strict';

const express = require('express');
const logger = require('../../../lib/logger');

const router = express.Router();

const frontMessagesRoute = require('./front');
const memberMessagesRoute = require('./member');
const signupMessagesRoute = require('./signup');
const updateMessageRoute = require('./update');
const broadcastMessagesRoute = require('./broadcast');
const analyticsHelper = require('../../../lib/helpers/analytics');
const subscriptionStatusActiveRoute = require('./subscription-status-active');

/**
 * Nested router that will handle PATCH requests to /messages/:messageId
 */
router.patch('/:messageId', updateMessageRoute);

router.post('/', (req, res, next) => {
  const origin = req.query.origin;
  logger.debug('Origin', { origin }, req);
  analyticsHelper.addCustomAttributes({ origin });
  if (origin === 'broadcast') {
    broadcastMessagesRoute(req, res, next);
  } else if (origin === 'front') {
    frontMessagesRoute(req, res, next);
  } else if (origin === 'signup') {
    signupMessagesRoute(req, res, next);
  } else if (origin === 'subscriptionStatusActive') {
    subscriptionStatusActiveRoute(req, res, next);
  } else {
    memberMessagesRoute(req, res, next);
  }
});

module.exports = router;
