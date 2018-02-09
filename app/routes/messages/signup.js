'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const outboundMessageConfig = require('../../../config/lib/middleware/messages/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/signup/params');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const validateUserMiddleware = require('../../../lib/middleware/messages/user-validate');
const getConversationMiddleware = require('../../../lib/middleware/messages/conversation-get');
const createConversationMiddleware = require('../../../lib/middleware/messages/conversation-create');
const getCampaignMiddleware = require('../../../lib/middleware/messages/signup/campaign-get');
const updateConversationMiddleware = require('../../../lib/middleware/messages/signup/conversation-update');
const loadOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-load');
const createOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-create');

router.use(paramsMiddleware());

// Fetch Northstar User.
router.use(getUserMiddleware());
router.use(validateUserMiddleware());

// Find or create Conversation.
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

router.use(getCampaignMiddleware());
router.use(updateConversationMiddleware());

// Load/create outbound message
router.use(loadOutboundMessageMiddleware(outboundMessageConfig));
router.use(createOutboundMessageMiddleware(outboundMessageConfig));

module.exports = router;
