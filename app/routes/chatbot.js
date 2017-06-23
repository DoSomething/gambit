'use strict';

const express = require('express');
const bot = require('../../lib/bot');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const getUserMiddleware = require('../../lib/middleware/user-get');
const createUserMiddleware = require('../../lib/middleware/user-create');
const createInboundMessageMiddleware = require('../../lib/middleware/message-inbound-create');
const createOutboundMessageMiddleware = require('../../lib/middleware/message-outbound-create');
const getBotReplyMiddleware = require('../../lib/middleware/bot-get-reply');
const brainReplyMiddleware = require('../../lib/middleware/reply-brain');
const michaelTopicMiddleware = require('../../lib/middleware/reply-michael');
const botReplySignupKeywordMiddleware = require('../../lib/middleware/bot-reply-signup-keyword');
const botReplySignupMenuMiddleware = require('../../lib/middleware/bot-reply-signup-menu');
const botReplySignupContinueMiddleware = require('../../lib/middleware/bot-reply-signup-continue');

router.use(getUserMiddleware());
router.use(createUserMiddleware());
router.use(createInboundMessageMiddleware());
router.use(getBotReplyMiddleware());
router.use(brainReplyMiddleware());
router.use(michaelTopicMiddleware());
// router.use(botReplySignupKeywordMiddleware());
// router.use(botReplySignupMenuMiddleware());
// router.use(botReplySignupContinueMiddleware());
router.use(createOutboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendChatbotResponse(req, res));

module.exports = router;
