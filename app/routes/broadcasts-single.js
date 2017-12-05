'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

// Middleware
const paramsMiddleware = require('../../lib/middleware/broadcasts-single/params');
const getBroadcastMiddleware = require('../../lib/middleware/broadcasts-single/broadcast');
const getStatsMiddleware = require('../../lib/middleware/broadcasts-single/stats');
const getWebhookMiddleware = require('../../lib/middleware/broadcasts-single/webhook');

router.get('/',
  paramsMiddleware(),
  getBroadcastMiddleware(),
  getStatsMiddleware(),
  getWebhookMiddleware());

module.exports = router;
