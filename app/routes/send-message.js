'use strict';

const express = require('express');

const router = express.Router();

const frontMiddleware = require('../../lib/middleware/send-message/receive-front');
const getUserMiddleware = require('../../lib/middleware/user-get-by-id');
const outboundMessageMiddleware = require('../../lib/middleware/send-message/message-outbound');

router.use(frontMiddleware());
router.use(getUserMiddleware());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => {
  req.user.sendMessage(req.sendMessageText);

  res.send(req.body);
});

module.exports = router;
