'use strict';

const express = require('express');
const logger = require('heroku-logger');
const front = require('../../lib/front');

const router = express.Router();

router.post('/', (req, res) => {
  const message = front.parseOutgoingMessage(req);
  logger.debug('POST /send-message', message);

  res.send(req.body);
});

module.exports = router;
