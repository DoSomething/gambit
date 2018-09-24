'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const outboundMessageConfig = require('../../../config/lib/middleware/messages/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/broadcast/params');
const getBroadcastMiddleware = require('../../../lib/middleware/messages/broadcast/broadcast-get');
const parseBroadcastMiddleware = require('../../../lib/middleware/messages/broadcast/broadcast-parse');
const getConversationMiddleware = require('../../../lib/middleware/messages/conversation-get');
const createConversationMiddleware = require('../../../lib/middleware/messages/conversation-create');
const updateConversationMiddleware = require('../../../lib/middleware/messages/broadcast/conversation-update');
const loadOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-load');
const createOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-create');
const sendOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-send');

router.use(paramsMiddleware());
router.use(getBroadcastMiddleware());
router.use(parseBroadcastMiddleware());

/**
 * TODO: Here we will get the sms_status from the Fastly cache
 * Removed: router.use(getUserMiddleware(getUserConfig));
 */

/**
 * TODO: Here we will validate the subscription status and mobile Validation
 * Removed: router.use(validateOutboundMessageMiddleware(outboundMessageConfig));
 * */

router.use(getConversationMiddleware());
router.use(createConversationMiddleware());
router.use(updateConversationMiddleware());

router.use(loadOutboundMessageMiddleware(outboundMessageConfig));
router.use(createOutboundMessageMiddleware(outboundMessageConfig));
router.use(sendOutboundMessageMiddleware());

module.exports = router;
