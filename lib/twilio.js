'use strict';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

const client = require('twilio')(accountSid, authToken);

module.exports.postMessage = function (phone, messageText) {
  const payload = {
    to: phone,
    messagingServiceSid,
    body: messageText,
  };

  return client.messages.create(payload);
};
