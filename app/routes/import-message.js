'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const outboundMessageConfig = require('../../config/lib/middleware/import-message/message-outbound');

// Middleware
const paramsMiddleware = require('../../lib/middleware/import-message/params');
const getBroadcastMiddleware = require('../../lib/middleware/messages/broadcast/broadcast-get');
const parseBroadcastMiddleware = require('../../lib/middleware/messages/broadcast/parse-broadcast');
const getConvoMiddleware = require('../../lib/middleware/conversation-get');
const createConvoMiddleware = require('../../lib/middleware/conversation-create');
const updateConvoMiddleware = require('../../lib/middleware/messages/broadcast/conversation-update');
const loadOutboundMessageMiddleware = require('../../lib/middleware/message-outbound-load');
const createOutboundMessageMiddleware = require('../../lib/middleware/message-outbound-create');

router.use(paramsMiddleware());
router.use(getBroadcastMiddleware());
router.use(parseBroadcastMiddleware());

// Load or create conversation
router.use(getConvoMiddleware());
router.use(createConvoMiddleware());

router.use(updateConvoMiddleware());

// Load/create outbound message
router.use(loadOutboundMessageMiddleware(outboundMessageConfig));
router.use(createOutboundMessageMiddleware(outboundMessageConfig));

module.exports = router;
