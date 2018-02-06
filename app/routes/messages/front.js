'use strict';

const express = require('express');

const router = express.Router();

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/support/params');
// const getUserMiddleware = require('../../lib/middleware/messages/user-get');
// We'll need to tweak validation to allow sending message paused Users.
// const validateUserMiddleware = require('../../lib/middleware/messages/user-validate');
const getConversationMiddleware = require('../../../lib/middleware/conversation-get');
const frontMiddleware = require('../../../lib/middleware/messages/support/front');
const createOutboundMessageMiddleware = require('../../../lib/middleware/message-outbound-create');

router.use(paramsMiddleware());

// Fetch Northstar User.
// router.use(getUserMiddleware());
// router.use(validateUserMiddleware());

router.use(getConversationMiddleware());
router.use(frontMiddleware());
router.use(createOutboundMessageMiddleware());

module.exports = router;
