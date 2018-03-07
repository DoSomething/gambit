'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const getUserConfig = require('../../../config/lib/middleware/messages/user-get');
const outboundMessageConfig = require('../../../config/lib/middleware/messages/broadcast/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/broadcast/params');
const getBroadcastMiddleware = require('../../../lib/middleware/messages/broadcast/broadcast-get');
const parseBroadcastMiddleware = require('../../../lib/middleware/messages/broadcast/parse-broadcast');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const validateOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-validate');
const getConvoMiddleware = require('../../../lib/middleware/messages/conversation-get');
const createConvoMiddleware = require('../../../lib/middleware/messages/conversation-create');
const updateConvoMiddleware = require('../../../lib/middleware/messages/broadcast/conversation-update');
const loadOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-load');
const createOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-create');
const sendOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-send');

router.use(paramsMiddleware());
router.use(getBroadcastMiddleware());
router.use(parseBroadcastMiddleware());
router.use(getUserMiddleware(getUserConfig));
router.use(validateOutboundMessageMiddleware(outboundMessageConfig));

router.use(getConvoMiddleware());
router.use(createConvoMiddleware());

router.use(updateConvoMiddleware());

router.use(loadOutboundMessageMiddleware(outboundMessageConfig));
router.use(createOutboundMessageMiddleware(outboundMessageConfig));
router.use(sendOutboundMessageMiddleware());

module.exports = router;
