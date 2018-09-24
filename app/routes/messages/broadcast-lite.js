'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const outboundMessageConfig = require('../../../config/lib/middleware/messages/message-outbound');

// Middleware
const createOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-create');
const createConversationMiddleware = require('../../../lib/middleware/messages/conversation-create');
const getBroadcastMiddleware = require('../../../lib/middleware/messages/broadcast/broadcast-get');
const getConversationMiddleware = require('../../../lib/middleware/messages/conversation-get');
const loadOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-load');
const paramsMiddleware = require('../../../lib/middleware/messages/broadcast/params');
const parseBroadcastMiddleware = require('../../../lib/middleware/messages/broadcast/broadcast-parse');
const sendOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-send');
const updateConversationMiddleware = require('../../../lib/middleware/messages/broadcast/conversation-update');
const validateOutboundMessageMiddleware = require('../../../lib/middleware/messages/broadcast-lite/message-outbound-validate');

router.use(paramsMiddleware());
router.use(getBroadcastMiddleware());
router.use(parseBroadcastMiddleware());

/**
 * TODO: Here we will get the sms_status from the Fastly cache
 * Removed: router.use(getUserMiddleware(getUserConfig));
 */

router.use(validateOutboundMessageMiddleware());

router.use(getConversationMiddleware());
router.use(createConversationMiddleware());
router.use(updateConversationMiddleware());

router.use(loadOutboundMessageMiddleware(outboundMessageConfig));
router.use(createOutboundMessageMiddleware(outboundMessageConfig));
router.use(sendOutboundMessageMiddleware());

module.exports = router;
