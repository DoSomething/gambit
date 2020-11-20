'use strict';

const express = require('express');

const router = express.Router();

// Middleware
const inboundMiddleware = require('../../../lib/middleware/studio/inbound');
const outboundMiddleware = require('../../../lib/middleware/studio/outbound');

router.post('/replies', inboundMiddleware());
router.post('/broadcasts', outboundMiddleware());

module.exports = router;
