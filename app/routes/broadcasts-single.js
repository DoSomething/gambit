'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

// Middleware
const paramsMiddleware = require('../../lib/middleware/broadcasts-single/params');
const getBroadcastMiddleware = require('../../lib/middleware/broadcasts-single/broadcast');
const getWebhookMiddleware = require('../../lib/middleware/broadcasts-single/webhook');
const getStatsCacheMiddleware = require('../../lib/middleware/broadcasts-single/stats-cache-get');
const setStatsCacheMiddleware = require('../../lib/middleware/broadcasts-single/stats-cache-set');

router.get('/',
  paramsMiddleware(),
  getBroadcastMiddleware(),
  getWebhookMiddleware(),
  getStatsCacheMiddleware(),
  setStatsCacheMiddleware());

module.exports = router;
