'use strict';

const express = require('express');

const router = express.Router();

const repliesMiddleware = require('../../../lib/middleware/studio/inbound');
const createExecutionMiddleware = require('../../../lib/middleware/studio/execution-create');
const getExecutionMiddleware = require('../../../lib/middleware/studio/execution-get');
const getExecutionsMiddleware = require('../../../lib/middleware/studio/executions-get');

router.post('/replies', repliesMiddleware());
router.post('/broadcasts', createExecutionMiddleware());
router.get('/executions', getExecutionsMiddleware());
router.get('/executions/:executionId', getExecutionMiddleware());

module.exports = router;
