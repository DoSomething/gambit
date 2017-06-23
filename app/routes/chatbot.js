'use strict';

const express = require('express');
const bot = require('../../lib/bot');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const paramsMiddleware = require('../../lib/middleware/params');
const getUserMiddleware = require('../../lib/middleware/user-get');
const createUserMiddleware = require('../../lib/middleware/user-create');
const createInboundMessageMiddleware = require('../../lib/middleware/message-inbound-create');
const createOutboundMessageMiddleware = require('../../lib/middleware/message-outbound-create');

const getBotReplyMiddleware = require('../../lib/middleware/bot-get-reply');
const brainReplyMiddleware = require('../../lib/middleware/reply-brain');
const defaultReplyMiddleware = require('../../lib/middleware/reply-default');
const noReplyMiddleware = require('../../lib/middleware/reply-noreply');
const michaelTopicMiddleware = require('../../lib/middleware/reply-michael');
// const signupKeywordMiddleware = require('../../lib/middleware/bot-reply-signup-keyword');
// const signupMenuMiddleware = require('../../lib/middleware/bot-reply-signup-menu');
// const signupContinueMiddleware = require('../../lib/middleware/bot-reply-signup-continue');

router.use(paramsMiddleware());
// Load user.
router.use(getUserMiddleware());
router.use(createUserMiddleware());
router.use(createInboundMessageMiddleware());
// Get bot response to user message.
router.use(getBotReplyMiddleware());
// Parse response.
router.use(brainReplyMiddleware());
router.use(noReplyMiddleware());
router.use(michaelTopicMiddleware());
// router.use(signupKeywordMiddleware());
// router.use(signupMenuMiddleware());
// router.use(signupContinueMiddleware());
router.use(defaultReplyMiddleware());
router.use(createOutboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendChatbotResponse(req, res));

module.exports = router;
