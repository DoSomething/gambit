'use strict';

const express = require('express');
const helpers = require('../../lib/helpers');

const router = express.Router();

const supportParamsMiddleware = require('../../lib/middleware/send-message/params-support');
const campaignParamsMiddleware = require('../../lib/middleware/send-message/params-campaign');
const getConversationMiddleware = require('../../lib/middleware/conversation-get');
const createConversationMiddleware = require('../../lib/middleware/conversation-create');
const campaignMiddleware = require('../../lib/middleware/send-message/campaign');
const supportMiddleware = require('../../lib/middleware/send-message/support');
const outboundMessageMiddleware = require('../../lib/middleware/send-message/message-outbound');

router.use(supportParamsMiddleware());
router.use(campaignParamsMiddleware());

router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

router.use(campaignMiddleware());
router.use(supportMiddleware());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendResponse(req, res));

module.exports = router;
