'use strict';

const express = require('express');
const bot = require('../../lib/bot');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const getUserMiddleware = require('../../lib/middleware/user-get');
const createUserMiddleware = require('../../lib/middleware/user-create');
const createInboundMessageMiddleware = require('../../lib/middleware/message-inbound');
const createOutboundMessageMiddleware = require('../../lib/middleware/message-outbound');
const getBotReplyMiddleware = require('../../lib/middleware/bot-get-reply');
const botReplyRivescriptMiddleware = require('../../lib/middleware/bot-reply-rivescript');
const botReplyMichaelMiddleware = require('../../lib/middleware/bot-reply-michael');
const botReplySignupKeywordMiddleware = require('../../lib/middleware/bot-reply-signup-keyword');
const botReplySignupMenuMiddleware = require('../../lib/middleware/bot-reply-signup-menu');
const botReplySignupContinueMiddleware = require('../../lib/middleware/bot-reply-signup-continue');

router.use(getUserMiddleware());
router.use(createUserMiddleware());
router.use(createInboundMessageMiddleware());
router.use(getBotReplyMiddleware());
router.use(botReplyRivescriptMiddleware());
router.use(botReplyMichaelMiddleware());
router.use(botReplySignupKeywordMiddleware());
router.use(botReplySignupMenuMiddleware());
router.use(botReplySignupContinueMiddleware());
router.use(createOutboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendChatbotResponse(req, res));

module.exports = router;
