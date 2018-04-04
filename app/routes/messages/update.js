'use strict';

const express = require('express');

// @see http://expressjs.com/en/api.html#express.router
const router = express.Router({
  mergeParams: true,
});

// Middleware configs
const getUserConfig = require('../../../config/lib/middleware/messages/update/user-get');

// Middleware
const { middleware: paramsMiddleware } = require('../../../lib/middleware/messages/update/params');
const messageUpdateMiddleware = require('../../../lib/middleware/messages/message-update');
const shouldUpdateUserMiddleware = require('../../../lib/middleware/messages/update/user-should-update');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const updateUserMiddleware = require('../../../lib/middleware/messages/update/user-update');

router.use(paramsMiddleware());
router.use(messageUpdateMiddleware());
router.use(shouldUpdateUserMiddleware());
router.use(getUserMiddleware(getUserConfig));
router.use(updateUserMiddleware());

module.exports = router;
