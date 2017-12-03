'use strict';

const express = require('express');

const router = express.Router();

// Middleware
const paramsMiddleware = require('../../lib/middleware/broadcast-settings/params');
const getBroadcastMiddleware = require('../../lib/middleware/broadcast-settings/broadcast');
const totalsMiddleware = require('../../lib/middleware/broadcast-settings/totals');
const generateSettingsMiddleware = require('../../lib/middleware/broadcast-settings/settings');

router.get('/:broadcastId',
  paramsMiddleware(),
  getBroadcastMiddleware(),
  totalsMiddleware(),
  generateSettingsMiddleware());

module.exports = router;
