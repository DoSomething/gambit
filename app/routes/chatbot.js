'use strict';

const express = require('express');
const bot = require('../../lib/bot');

const router = express.Router();
bot.getBot();

const getUserMiddleware = require('../../lib/middleware/user-get');
const getBotReplyMiddleware = require('../../lib/middleware/bot-get-reply');
const botReplyRivescriptMiddleware = require('../../lib/middleware/bot-reply-rivescript');
const botReplyMichaelMiddleware = require('../../lib/middleware/bot-reply-michael');
const botReplySignupKeywordMiddleware = require('../../lib/middleware/bot-reply-signup-keyword');
const botReplySignupMenuMiddleware = require('../../lib/middleware/bot-reply-signup-menu');
const botReplySignupContinueMiddleware = require('../../lib/middleware/bot-reply-signup-continue');

router.use(getUserMiddleware());
router.use(getBotReplyMiddleware());
router.use(botReplyRivescriptMiddleware());
router.use(botReplyMichaelMiddleware());
router.use(botReplySignupKeywordMiddleware());
router.use(botReplySignupMenuMiddleware());
router.use(botReplySignupContinueMiddleware());

router.post('/', (req, res) => {
  return res.send({
    message: req.renderedReplyMessage,
    user: req.user,
  });
});

module.exports = router;
