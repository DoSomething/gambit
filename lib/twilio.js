'use strict';

const Twilio = require('twilio');
const logger = require('heroku-logger');
const config = require('../config/lib/twilio');

/**
 * Setup.
 */
let client;

/**
 * @return {Object}
 */
module.exports.createNewClient = function createNewClient() {
  const loggerMsg = 'twilio.createNewClient';

  try {
    client = new Twilio(config.accountSid, config.authToken);
    logger.info(`${loggerMsg} success`, client);
  } catch (err) {
    logger.error(`${loggerMsg} error`, err);
  }
  return client;
};

/**
 * @return {Object}
 */
module.exports.getClient = function getClient() {
  if (!client) {
    return exports.createNewClient();
  }
  return client;
};

/**
 * @return {boolean}
 */
function useTwilioTestCreds() {
  return config.useTwilioTestCreds === 'true';
}

/**
 * Posts to Twilio API to send given messageText to given phone.
 * @param {string} phone
 * @param {string} messageText
 * @return {Promise}
 */
module.exports.postMessage = function (phone, messageText) {
  const useTestCreds = useTwilioTestCreds();
  const payload = {
    to: useTestCreds ? config.toNumber : phone,
    body: messageText,
  };

  // Twilio test credentials don't support messagingServiceSid.
  // @see https://www.twilio.com/docs/api/rest/test-credentials#test-sms-messages-parameters
  if (useTestCreds) {
    payload.from = config.fromNumber;
  } else {
    payload.messagingServiceSid = config.messagingServiceSid;
  }

  return exports.getClient().messages.create(payload);
};
