'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const outboundMessageConfig = require('../../../config/lib/middleware/messages/support/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/support/params');
const getConversationMiddleware = require('../../../lib/middleware/messages/conversation-get');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const validateOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-validate');
const updateConversationMiddleware = require('../../../lib/middleware/messages/support/conversation-update');
// Note: we're not adding Load Outbound Message middleware, because Front messages are posted
// directly to Gambit Conversations -- no retryCount to check.
const createOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-create');

router.use(paramsMiddleware());
router.use(getConversationMiddleware());

router.use(getUserMiddleware());
router.use(validateOutboundMessageMiddleware(outboundMessageConfig));

router.use(updateConversationMiddleware());
router.use(createOutboundMessageMiddleware(outboundMessageConfig));

module.exports = router;
