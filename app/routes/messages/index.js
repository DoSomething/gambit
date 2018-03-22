'use strict';

const express = require('express');

const router = express.Router();

const analyticsHelper = require('../../../lib/helpers/analytics');
const Message = require('../../models/Message');
const broadcastMessagesRoute = require('./broadcast');
const frontMessagesRoute = require('./front');
const memberMessagesRoute = require('./member');
const signupMessagesRoute = require('./signup');
const helpers = require('../../../lib/helpers');

router.patch('/:messageId', (req, res) => {
  // TODO: Move to middleware?
  // TODO: update user to undeliverable when `failedAt` and the following codes are detected:
  //
  // 30006: Landline or unreachable carrier
  //        Example: https://www.twilio.com/console/sms/logs/SM933e25ea371f4f10a213aef5180245e1
  // 30004: Message blocked
  // 30008: Unknown error (?)
  //        Example: https://www.twilio.com/console/sms/logs/SMdc6b3e74246c437ab3328f346ce86ef4
  // 30003: Unreachable destination handset (?)
  //        Example: https://www.twilio.com/console/sms/logs/SM4367f21c9cfb40e2b87216227a20a109
  //
  helpers.util.deepUpdateWithDotNotationParser(req.body)
    .then((update) => {
      Message.findByIdAndUpdate(req.params.messageId, update)
        .then(() => res.sendStatus(204))
        .catch(error => helpers.sendErrorResponse(res, error));
    });
  analyticsHelper.addCustomAttributes({
    messageId: req.params.messageId,
  });
});

router.post('/', (req, res, next) => {
  const origin = req.query.origin;
  analyticsHelper.addCustomAttributes({ origin });
  if (origin === 'broadcast') {
    broadcastMessagesRoute(req, res, next);
  } else if (origin === 'front') {
    frontMessagesRoute(req, res, next);
  } else if (origin === 'signup') {
    signupMessagesRoute(req, res, next);
  } else {
    memberMessagesRoute(req, res, next);
  }
});

module.exports = router;
