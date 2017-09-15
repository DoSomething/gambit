'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const outboundMessageConfig = require('../../config/lib/middleware/send-message/message-outbound');

// Middleware
const supportParamsMiddleware = require('../../lib/middleware/send-message/params-support');
const campaignParamsMiddleware = require('../../lib/middleware/send-message/params-campaign');
const getConversationMiddleware = require('../../lib/middleware/conversation-get');
const createConversationMiddleware = require('../../lib/middleware/conversation-create');
const campaignMiddleware = require('../../lib/middleware/send-message/campaign');
const supportMiddleware = require('../../lib/middleware/send-message/support');
const loadOutboundMessageMiddleware = require('../../lib/middleware/message-outbound-load');
const createOutboundMessageMiddleware = require('../../lib/middleware/message-outbound-create');

router.use(supportParamsMiddleware());
router.use(campaignParamsMiddleware());

router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

router.use(campaignMiddleware());
router.use(supportMiddleware());

// Load/create outbound message
router.use(loadOutboundMessageMiddleware(outboundMessageConfig));
router.use(createOutboundMessageMiddleware(outboundMessageConfig));

module.exports = router;
