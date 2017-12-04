'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

// Middleware
const paramsMiddleware = require('../../lib/middleware/broadcasts-single/params');
const getBroadcastMiddleware = require('../../lib/middleware/broadcasts-single/broadcast');
const totalsMiddleware = require('../../lib/middleware/broadcasts-single/totals');
const generateSettingsMiddleware = require('../../lib/middleware/broadcasts-single/settings');

router.get('/',
  paramsMiddleware(),
  getBroadcastMiddleware(),
  totalsMiddleware(),
  generateSettingsMiddleware());

module.exports = router;
