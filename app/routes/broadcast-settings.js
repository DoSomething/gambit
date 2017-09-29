'use strict';

const express = require('express');

const router = express.Router();

// Middleware
const broadcastMiddleware = require('../../lib/middleware/broadcast-settings/broadcast');
const generateSettingsMiddleware = require('../../lib/middleware/broadcast-settings/settings');

router.get('/:broadcastId',
  broadcastMiddleware(),
  generateSettingsMiddleware());

module.exports = router;
