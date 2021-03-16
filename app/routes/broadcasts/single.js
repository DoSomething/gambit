'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

const webhookConfig = require('../../../config/lib/middleware/broadcasts/single/webhook');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/broadcasts/single/params');
const getBroadcastMiddleware = require('../../../lib/middleware/broadcasts/single/broadcast');
const getWebhookMiddleware = require('../../../lib/middleware/broadcasts/single/webhook');
const getStatsMiddleware = require('../../../lib/middleware/broadcasts/single/stats');

router.get('/',
  paramsMiddleware(),
  getBroadcastMiddleware(),
  getWebhookMiddleware(webhookConfig),
  getStatsMiddleware());

module.exports = router;
