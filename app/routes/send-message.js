'use strict';

const express = require('express');
const logger = require('heroku-logger');
const front = require('../../lib/front');
const slack = require('../../lib/slack');

const router = express.Router();

router.post('/', (req, res) => {
  const frontMessage = front.parseOutgoingMessage(req);
  logger.debug('POST /send-message', frontMessage);

  req.user.sendMessage(frontMessage.text);

  res.send(req.body);
});

module.exports = router;
