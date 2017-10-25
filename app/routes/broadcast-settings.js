'use strict';

const express = require('express');

const router = express.Router();

// Middleware
const paramsMiddleware = require('../../lib/middleware/broadcast-settings/params');
const broadcastMiddleware = require('../../lib/middleware/broadcast-settings/broadcast');
const generateSettingsMiddleware = require('../../lib/middleware/broadcast-settings/settings');

router.get('/:broadcastId',
  paramsMiddleware(),
  broadcastMiddleware(),
  generateSettingsMiddleware());

module.exports = router;
