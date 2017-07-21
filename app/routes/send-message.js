'use strict';

const express = require('express');

const router = express.Router();

const paramsMiddleware = require('../../lib/middleware/send-message/params');
const getConversationMiddleware = require('../../lib/middleware/conversation-get');
const supportResolvedMiddleware = require('../../lib/middleware/send-message/support-resolved');
const outboundMessageMiddleware = require('../../lib/middleware/send-message/message-outbound');

router.use(paramsMiddleware());
router.use(getConversationMiddleware());
router.use(supportResolvedMiddleware());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => {
  req.conversation.sendMessage(req.sendMessageText);

  res.send(req.body);
});

module.exports = router;
