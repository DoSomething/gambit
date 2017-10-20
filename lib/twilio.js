'use strict';

const config = require('../config/lib/twilio');

const client = require('twilio')(config.accountSid, config.authToken);

function useTwilioTestCreds() {
  return config.useTwilioTestCreds === 'true';
}

module.exports.postMessage = function (phone, messageText) {
  const payload = {
    to: useTwilioTestCreds() ? config.toNumber : phone,
    body: messageText,
  };

  // Twilio test credentials don't support messagingServiceSid.
  // @see https://www.twilio.com/docs/api/rest/test-credentials#test-sms-messages-parameters
  if (useTwilioTestCreds()) {
    payload.from = config.fromNumber;
  } else {
    payload.messagingServiceSid = config.messagingServiceSid;
  }

  return client.messages.create(payload);
};
