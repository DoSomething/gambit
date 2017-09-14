'use strict';

const express = require('express');

const router = express.Router();

const paramsMiddleware = require('../../lib/middleware/import-message/params');
const getConvoMiddleware = require('../../lib/middleware/conversation-get');
const createConvoMiddleware = require('../../lib/middleware/conversation-create');
const broadcastMiddleware = require('../../lib/middleware/import-message/broadcast');
const updateConvoMiddleware = require('../../lib/middleware/import-message/conversation-update');
const loadOutboundImportMessageMiddleware = require('../../lib/middleware/import-message/message-outbound-load');
const createOutboundImportMessageMiddleware = require('../../lib/middleware/import-message/message-outbound-create');

router.use(paramsMiddleware());
router.use(broadcastMiddleware());

// Load or create conversation
router.use(getConvoMiddleware());
router.use(createConvoMiddleware());

router.use(updateConvoMiddleware());

// Load/create outbound message
router.use(loadOutboundImportMessageMiddleware());
router.use(createOutboundImportMessageMiddleware());

module.exports = router;
