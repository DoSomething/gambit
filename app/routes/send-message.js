'use strict';

const express = require('express');
const helpers = require('../../lib/helpers');

const router = express.Router();

const campaignMiddleware = require('../../lib/middleware/send-message/campaign');
const supportMiddleware = require('../../lib/middleware/send-message/params');
const getConversationMiddleware = require('../../lib/middleware/conversation-get');
const supportResolvedMiddleware = require('../../lib/middleware/send-message/support-resolved');
const outboundMessageMiddleware = require('../../lib/middleware/send-message/message-outbound');

router.use(getConversationMiddleware());
router.use(campaignMiddleware());
//router.use(supportMiddleware());
//router.use(supportResolvedMiddleware());
router.use(outboundMessageMiddleware());
router.post('/', (req, res) => helpers.sendResponse(req, res));

module.exports = router;
