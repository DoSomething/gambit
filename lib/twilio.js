'use strict';

const config = require('../config/lib/twilio');

const client = require('twilio')(config.accountSid, config.authToken);

module.exports.postMessage = function (phone, messageText) {
  const payload = {
    to: phone,
    body: messageText,
  };

  // Twilio test credentials don't support messagingServiceSid.
  if (config.messagingServiceSid && config.useTwilioTestCreds !== 'true') {
    payload.messagingServiceSid = config.messagingServiceSid;
  } else {
    payload.from = config.fromNumber;
  }

  return client.messages.create(payload);
};
