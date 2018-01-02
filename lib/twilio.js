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
    logger.info(`${loggerMsg} success`);
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
    from: useTestCreds ? config.testFromNumber : config.fromNumber,
    to: useTestCreds ? config.testToNumber : phone,
    body: messageText,
  };

  return exports.getClient().messages.create(payload);
};
