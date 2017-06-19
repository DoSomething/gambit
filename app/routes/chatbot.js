'use strict';

const express = require('express');
const bot = require('../../lib/bot');

const router = express.Router();
bot.getBot();

const lookUpUserMiddleware = require('../../lib/middleware/user-get');
const setBotUservarsMiddleware = require('../../lib/middleware/bot-set-uservars');
const getBotReplyMiddleware = require('../../lib/middleware/bot-get-reply');
const botRivescriptReplyMiddleware = require('../../lib/middleware/bot-reply-rivescript');

router.use(lookUpUserMiddleware());
router.use(setBotUservarsMiddleware());
router.use(getBotReplyMiddleware());
router.use(getBotReplyMiddleware());
router.use(botRivescriptReplyMiddleware());

router.post('/', (req, res) => {
  return res.send({
    message: req.renderedReplyMessage,
    user: req.user,
  });
});

module.exports = router;
