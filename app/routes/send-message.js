'use strict';

const express = require('express');
const helpers = require('../../lib/helpers');

const router = express.Router();

const paramsMiddleware = require('../../lib/middleware/send-message/params');
const getConversationMiddleware = require('../../lib/middleware/conversation-get');
const createConversationMiddleware = require('../../lib/middleware/conversation-create');

const campaignMiddleware = require('../../lib/middleware/send-message/campaign');
const supportMiddleware = require('../../lib/middleware/send-message/support');
const outboundMessageMiddleware = require('../../lib/middleware/send-message/message-outbound');

router.use(paramsMiddleware());
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

router.use(campaignMiddleware());
router.use(supportMiddleware());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendResponse(req, res));

module.exports = router;
