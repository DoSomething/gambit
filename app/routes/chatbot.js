'use strict';

const express = require('express');
const bot = require('../../lib/bot');

const router = express.Router();
bot.getBot();

const lookUpUserMiddleware = require('../../lib/middleware/user-get');
const setBotUservarsMiddleware = require('../../lib/middleware/bot-set-uservars');
const getBotReplyMiddleware = require('../../lib/middleware/bot-get-reply');

router.use(lookUpUserMiddleware());
router.use(setBotUservarsMiddleware());
router.use(getBotReplyMiddleware());

router.post('/', (req, res) => {
  bot.getReplyForUserMessage(req.user, req.body.message)
    .then((reply) => {
      return res.send({
        message: reply,
      });
    })
    .catch(err => console.log(err));
});

module.exports = router;
