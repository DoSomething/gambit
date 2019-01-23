'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const getUserConfig = require('../../../config/lib/middleware/messages/user-get');
const outboundMessageConfig = require('../../../config/lib/middleware/messages/support/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/support/params');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const validateOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-validate');
const getConversationMiddleware = require('../../../lib/middleware/messages/conversation-get');
const updateConversationMiddleware = require('../../../lib/middleware/messages/support/conversation-update');
// Note: we're not adding Load Outbound Message middleware, because Front messages are posted
// directly to Gambit Conversations -- no retryCount to check.
const createOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-create');
const sendOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-send');

router.use(paramsMiddleware());

router.use(getUserMiddleware(getUserConfig));
router.use(validateOutboundMessageMiddleware(outboundMessageConfig));

router.use(getConversationMiddleware());
router.use(updateConversationMiddleware());
/**
 * We don't attempt to "load" an outbound message because Front doesn't retry messages.
 * Unlike Blink which retries failed messages.
 */
router.use(createOutboundMessageMiddleware(outboundMessageConfig));
router.use(sendOutboundMessageMiddleware());

module.exports = router;
