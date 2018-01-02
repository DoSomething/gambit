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
module.exports.useTwilioTestCreds = function () {
  return config.useTwilioTestCreds === 'true';
};

/**
 * Returns payload to post to Twilio for given phone and messageText.
 * @param {string} phone
 * @param {string} messageText
 * @return {object}
 */
module.exports.getMessagePayload = function (phone, messageText) {
  const useTestCreds = exports.useTwilioTestCreds();
  const data = {
    from: useTestCreds ? config.testFromNumber : config.fromNumber,
    to: useTestCreds ? config.testToNumber : phone,
    body: messageText,
  };
  return data;
};

/**
 * Posts to Twilio API to send given messageText to given phone.
 * @param {string} phone
 * @param {string} messageText
 * @return {Promise}
 */
module.exports.postMessage = function (phone, messageText) {
  const data = exports.getMessagePayload(phone, messageText);

  return exports.getClient().messages.create(data);
};
