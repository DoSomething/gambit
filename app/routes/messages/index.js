'use strict';

const express = require('express');
const logger = require('../../../lib/logger');

const router = express.Router();

const analyticsHelper = require('../../../lib/helpers/analytics');
const broadcastMessagesRoute = require('./broadcast');
const broadcastLiteMessagesRoute = require('./broadcast-lite');
const frontMessagesRoute = require('./front');
const memberMessagesRoute = require('./member');
const subscriptionStatusActiveRoute = require('./subscription-status-active');
const updateMessageRoute = require('./update');

/**
 * Nested router that will handle PATCH requests to /messages/:messageId
 */
router.patch('/:messageId', updateMessageRoute);

router.post('/', (req, res, next) => {
  const { origin } = req.query;

  logger.debug('Origin', { origin }, req);
  analyticsHelper.addCustomAttributes({ origin });

  switch (origin) {
    case 'broadcast':
      broadcastMessagesRoute(req, res, next);
      break;

    case 'broadcastLite':
      broadcastLiteMessagesRoute(req, res, next);
      break;

    case 'front':
      frontMessagesRoute(req, res, next);
      break;

    case 'subscriptionStatusActive':
      subscriptionStatusActiveRoute(req, res, next);
      break;

    default:
      memberMessagesRoute(req, res, next);
      break;
  }
});

module.exports = router;
