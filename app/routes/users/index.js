'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

// Middleware
const indexMiddleware = require('../../../lib/middleware/users');

router.delete('/', indexMiddleware());

module.exports = router;
