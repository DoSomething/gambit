'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const getUserConfig = require('../../../config/lib/middleware/messages/user-get');
const outboundMessageConfig = require('../../../config/lib/middleware/messages/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/signup/params');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const validateOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-validate');
const getConversationMiddleware = require('../../../lib/middleware/messages/conversation-get');
const createConversationMiddleware = require('../../../lib/middleware/messages/conversation-create');
const getCampaignMiddleware = require('../../../lib/middleware/messages/signup/campaign-get');
const validateCampaignMiddleware = require('../../../lib/middleware/messages/signup/campaign-validate');
const parseCampaignMiddleware = require('../../../lib/middleware/messages/signup/campaign-parse');
const updateConversationMiddleware = require('../../../lib/middleware/messages/signup/conversation-update');
const loadOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-load');
const createOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-create');
const sendOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-send');

router.use(paramsMiddleware());

// Fetch campaign for campaignId param.
router.use(getCampaignMiddleware());
// Validate the signup campaign should trigger a message.
router.use(validateCampaignMiddleware());
// Parse campaign for message to send.
router.use(parseCampaignMiddleware());

// Fetch user for userId param.
router.use(getUserMiddleware(getUserConfig));
router.use(validateOutboundMessageMiddleware(outboundMessageConfig));

// Find or create conversation for user.
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());
// Set the conversation campaign.
router.use(updateConversationMiddleware());

// Send signup message.
router.use(loadOutboundMessageMiddleware(outboundMessageConfig));
router.use(createOutboundMessageMiddleware(outboundMessageConfig));
router.use(sendOutboundMessageMiddleware());

module.exports = router;
