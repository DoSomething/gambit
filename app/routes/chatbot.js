'use strict';

const express = require('express');
const bot = require('../../lib/bot');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const paramsMiddleware = require('../../lib/middleware/params');
const getUserMiddleware = require('../../lib/middleware/user-get');
const createUserMiddleware = require('../../lib/middleware/user-create');
const updateUserMiddleware = require('../../lib/middleware/user-update');

const createInboundMessageMiddleware = require('../../lib/middleware/message-inbound-create');
const createOutboundMessageMiddleware = require('../../lib/middleware/message-outbound-create');

const getBotReplyBrainMiddleware = require('../../lib/middleware/bot-reply-brain');
const brainReplyMiddleware = require('../../lib/middleware/reply-brain');
const noReplyMiddleware = require('../../lib/middleware/reply-noreply');
const michaelTopicMiddleware = require('../../lib/middleware/reply-michael');
const campaignKeywordMiddleware = require('../../lib/middleware/reply-campaign-keyword');
const campaignMenuMiddleware = require('../../lib/middleware/reply-campaign-menu');
const campaignContinueMiddleware = require('../../lib/middleware/reply-campaign');
const getBotReplyTextMiddleware = require('../../lib/middleware/bot-reply-text');

router.use(paramsMiddleware());
// Load user.
router.use(getUserMiddleware());
router.use(createUserMiddleware());
router.use(createInboundMessageMiddleware());
// Get bot response to user message.
router.use(getBotReplyBrainMiddleware());
// Parse response.
router.use(brainReplyMiddleware());
router.use(noReplyMiddleware());
router.use(michaelTopicMiddleware());
router.use(campaignKeywordMiddleware());
router.use(campaignMenuMiddleware());
router.use(campaignContinueMiddleware());
// Render response.
router.use(getBotReplyTextMiddleware());
router.use(updateUserMiddleware());
router.use(createOutboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendChatbotResponse(req, res));

module.exports = router;
