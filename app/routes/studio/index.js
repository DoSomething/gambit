'use strict';

const express = require('express');

const router = express.Router();

// Middleware
const indexMiddleware = require('../../../lib/middleware/studio');

router.get('/', indexMiddleware());

module.exports = router;
