'use strict';

const express = require('express');
const bot = require('../../lib/bot');

const router = express.Router();
bot.getBot();

const lookUpUserMiddleware = require('../../lib/middleware/user-get');
/**
 * Find or create User for given userId.
 */
router.use(lookUpUserMiddleware());

router.post('/', (req, res) => {
  bot.getReplyForUserMessage(req.user._id, req.body.message)
    .then((reply) => {
      return res.send({
        message: reply,
      });
    })
    .catch(err => console.log(err));
});

module.exports = router;
