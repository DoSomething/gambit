'use strict';

const express = require('express');

const router = express.Router();

// Middleware
const indexMiddleware = require('../../lib/middleware/broadcasts-index');

router.get('/', indexMiddleware());

module.exports = router;
