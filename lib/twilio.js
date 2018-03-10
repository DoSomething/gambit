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
    return client;
  } catch (err) {
    logger.error(`${loggerMsg} error`, err);
    throw new Error(err.message);
  }
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
 * Returns payload for creating a Twilio message.
 * @param {string} phone
 * @param {string} messageText
 * @param {string} mediaUrl
 * @return {object}
 */
module.exports.getMessagePayload = function (phone, messageText, mediaUrl) {
  const useTestCreds = exports.useTwilioTestCreds();
  const data = {
    from: useTestCreds ? config.testFromNumber : config.fromNumber,
    to: useTestCreds ? config.testToNumber : phone,
    body: messageText,
  };
  if (mediaUrl) {
    data.mediaUrl = mediaUrl;
  }
  return data;
};

/**
 * Posts to Twilio API to send given messageText to given phone.
 * @param {string} phone
 * @param {string} messageText
 * @param {string} mediaUrl
 * @return {Promise}
 */
module.exports.postMessage = function (phone, messageText, mediaUrl) {
  const data = exports.getMessagePayload(phone, messageText, mediaUrl);

  return exports.getClient().messages.create(data);
};
