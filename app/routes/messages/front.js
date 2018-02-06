'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const outboundMessageConfig = require('../../../config/lib/middleware/messages/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/support/params');
// const getUserMiddleware = require('../../lib/middleware/messages/user-get');
// We'll need to tweak validation to allow sending message paused Users.
// const validateUserMiddleware = require('../../lib/middleware/messages/user-validate');
const getConversationMiddleware = require('../../../lib/middleware/conversation-get');
const frontMiddleware = require('../../../lib/middleware/messages/support/front');
// Note: we're not adding the Load Outbound Message middleware, because Front messages are posted
// directly to Gambit Conversations, which means we're not retrying any failed requests here.
const createOutboundMessageMiddleware = require('../../../lib/middleware/message-outbound-create');

router.use(paramsMiddleware());

// Fetch Northstar User.
// router.use(getUserMiddleware());
// router.use(validateUserMiddleware());

router.use(getConversationMiddleware());
router.use(frontMiddleware());
router.use(createOutboundMessageMiddleware(outboundMessageConfig));

module.exports = router;
