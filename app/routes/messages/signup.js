'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const outboundMessageConfig = require('../../../config/lib/middleware/messages/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/signup/params');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const validateUserMiddleware = require('../../../lib/middleware/messages/user-validate');
const getConversationMiddleware = require('../../../lib/middleware/conversation-get');
const createConversationMiddleware = require('../../../lib/middleware/conversation-create');
const campaignMiddleware = require('../../../lib/middleware/messages/signup/campaign');
const loadOutboundMessageMiddleware = require('../../../lib/middleware/message-outbound-load');
const createOutboundMessageMiddleware = require('../../../lib/middleware/message-outbound-create');

router.use(paramsMiddleware());

// Fetch Northstar User.
router.use(getUserMiddleware());
router.use(validateUserMiddleware());

router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

router.use(campaignMiddleware());

// Load/create outbound message
router.use(loadOutboundMessageMiddleware(outboundMessageConfig));
router.use(createOutboundMessageMiddleware(outboundMessageConfig));

module.exports = router;
