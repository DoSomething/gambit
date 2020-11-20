'use strict';

const express = require('express');

const router = express.Router();

const repliesMiddleware = require('../../../lib/middleware/studio/inbound');
const broadcastsMiddleware= require('../../../lib/middleware/studio/outbound');

router.post('/replies', repliesMiddleware());
router.post('/broadcasts', broadcastsMiddleware());

module.exports = router;
