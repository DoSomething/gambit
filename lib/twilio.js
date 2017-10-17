'use strict';

const config = require('../config/lib/twilio');

const client = require('twilio')(config.accountSid, config.authToken);

module.exports.postMessage = function (phone, messageText) {
  const payload = {
    to: phone,
    body: messageText,
  };

  // Twilio test credentials don't support messagingServiceSid.
  if (config.useTwilioTestCreds === 'true') {
    payload.from = config.fromNumber;
  } else {
    payload.messagingServiceSid = config.messagingServiceSid;
  }

  return client.messages.create(payload);
};
