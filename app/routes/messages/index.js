'use strict';

const express = require('express');
const moment = require('moment');

const router = express.Router();

const Message = require('../../models/Message');
const broadcastMessagesRoute = require('./broadcast');
const frontMessagesRoute = require('./front');
const memberMessagesRoute = require('./member');
const signupMessagesRoute = require('./signup');


router.patch('/:messageId', (req, res) => {
  // Delivered
  // TODO: Chech if this is a delivered message indeed
  Message.updateMedatadaDeliveredAtByPlatformMessageId(req.body.MessageSid, moment().format())
    .then(message => res.send(message));
  // TODO: Handle when the request is to update failure state and possible update to user
});

router.post('/', (req, res, next) => {
  const origin = req.query.origin;
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
