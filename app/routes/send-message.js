'use strict';

const express = require('express');

const router = express.Router();

const receiveFrontMiddleware = require('../../lib/middleware/send-message/receive-front');
const getUserMiddleware = require('../../lib/middleware/user-get-by-id');
const supportResolved = require('../../lib/middleware/send-message/support-resolved');
const outboundMessageMiddleware = require('../../lib/middleware/send-message/message-outbound');

router.use(receiveFrontMiddleware());
router.use(getUserMiddleware());
router.use(supportResolved());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => {
  req.user.sendMessage(req.sendMessageText);

  res.send(req.body);
});

module.exports = router;
