'use strict';

const express = require('express');

const router = express.Router();

// Middleware
const inboundMiddleware = require('../../../lib/middleware/studio/inbound');
const outboundMiddleware = require('../../../lib/middleware/studio/outbound');

router.post('/', 
    inboundMiddleware(),
    outboundMiddleware(),
);

module.exports = router;
