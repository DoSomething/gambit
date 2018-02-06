'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const outboundMessageConfig = require('../../../config/lib/middleware/messages/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/support/params');
const getConversationMiddleware = require('../../../lib/middleware/conversation-get');
const updateConversationMiddleware = require('../../../lib/middleware/messages/support/conversation-update');
// Note: we're not adding the Load Outbound Message middleware, because Front messages are posted
// directly to Gambit Conversations, which means we're not retrying any failed requests here.
const createOutboundMessageMiddleware = require('../../../lib/middleware/message-outbound-create');

router.use(paramsMiddleware());
router.use(getConversationMiddleware());

// TODO: Fetch the User for the Conversation, verify they are not unsubscribed.

router.use(updateConversationMiddleware());
router.use(createOutboundMessageMiddleware(outboundMessageConfig));

module.exports = router;
