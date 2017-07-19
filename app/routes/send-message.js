'use strict';

const express = require('express');
const logger = require('heroku-logger');
const front = require('../../lib/front');

const router = express.Router();

router.post('/', (req, res) => {
  logger.debug('send-message request.body', req.body);
  const frontMessage = front.parseOutgoingMessage(req);

  req.user.sendMessage(frontMessage.text);

  res.send(req.body);
});

module.exports = router;
