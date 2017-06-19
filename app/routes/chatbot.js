'use strict';

const express = require('express');
const bot = require('../../lib/bot');

const router = express.Router();
bot.getBot();

const lookUpUserMiddleware = require('../../lib/middleware/user-get');
const setBotUservarsMiddleware = require('../../lib/middleware/bot-set-uservars');
const getBotReplyMiddleware = require('../../lib/middleware/bot-get-reply');
const botReplyRivescriptMiddleware = require('../../lib/middleware/bot-reply-rivescript');
const botReplyMichaelMiddleware = require('../../lib/middleware/bot-reply-michael');

router.use(lookUpUserMiddleware());
router.use(setBotUservarsMiddleware());
router.use(getBotReplyMiddleware());
router.use(getBotReplyMiddleware());
router.use(botReplyRivescriptMiddleware());
router.use(botReplyMichaelMiddleware());

router.post('/', (req, res) => {
  return res.send({
    message: req.renderedReplyMessage,
    user: req.user,
  });
});

module.exports = router;
