'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const getUserConfig = require('../../../config/lib/middleware/messages/user-get');
const outboundMessageConfig = require('../../../config/lib/middleware/messages/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/subscription-status-active/params');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const validateOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-validate');
const getConversationMiddleware = require('../../../lib/middleware/messages/conversation-get');
const createConversationMiddleware = require('../../../lib/middleware/messages/conversation-create');
const loadOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-load');
const createOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-create');
const sendOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-send');

router.use(paramsMiddleware());
// Fetch user for userId param.
router.use(getUserMiddleware(getUserConfig));
router.use(validateOutboundMessageMiddleware(outboundMessageConfig));
// Find or create conversation for user.
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());
// Send signup message.
router.use(loadOutboundMessageMiddleware(outboundMessageConfig));
router.use(createOutboundMessageMiddleware(outboundMessageConfig));
router.use(sendOutboundMessageMiddleware());

module.exports = router;
