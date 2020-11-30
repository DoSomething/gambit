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
    logger.debug(`${loggerMsg} success`);
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
  return config.useTwilioTestCreds;
};

/**
 * Returns payload for creating a Twilio message.
 *
 * From Twilio documentation:
 * There is a slight difference in API response when specifying the MessagingServiceSid parameter.
 * When you only specify the From parameter, Twilio will validate the phone numbers synchronously
 * and return either a queued status or an error. When specifying the MessagingServiceSid
 * parameter, Twilio will first return an accepted status.
 *
 * @param {string} phone
 * @param {string} messageText
 * @param {string} mediaUrl
 * @return {object}
 */
module.exports.getMessagePayload = function (phone, messageText, mediaUrl) {
  const useTestCreds = exports.useTwilioTestCreds();
  const data = {
    from: useTestCreds ? config.testFromNumber : config.fromNumber,
    to: phone,
    body: messageText,
    mediaUrl,
    // Currently undocumented parameter to use Twilio smart encoding to replace unicode characters.
    // @see https://www.twilio.com/docs/sms/services/copilot-smart-encoding-char-list for spec.
    // @see https://dosomething.slack.com/archives/C5TSNJ6GL/p1523047665000246 for recommendation.
    smartEncoded: true,
  };

  /**
   * We are sending Twilio messages using a FROM number instead of a MessagingServiceSid.
   * In this case, we have to explicitly send a StatusCallback parameter to receive status
   * updates on the message.
   */
  if (config.statusCallbackUrl) {
    data.statusCallback = config.statusCallbackUrl;
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

/**
 * @param {String} to
 * @param {String} messageText
 * @return {Promise}
 */
module.exports.createExecution = (to, messageText) => {
  logger.debug('createExecution', { to, messageText });

  return exports.getClient().studio.flows(config.flowSid)
    .executions
    .create({ to, from: config.fromNumber, parameters: { messageText } })
    .then(execution => logger.debug('Execution created', { sid: execution.sid }));
};

/**
 * @param {String} to
 * @param {String} messageText
 * @return {Promise}
 */
module.exports.getExecutions = (args = {}) => {
  logger.debug('getExecutions', { args });

  return exports.getClient().studio.flows(config.flowSid)
    .executions
    .list(args)
};

/**
 * @param {String} executionId
 * @return {Promise}
 */
module.exports.getExecutionSteps = (executionId, args = {}) => {
  logger.debug('getExecutionSteps', { executionId });

  return exports.getClient().studio.flows(config.flowSid)
    .executions(executionId)
    .steps
    .list(args);
};

/**
 * @param {String} executionId
 * @return {Promise}
 */
module.exports.getStepContext = (executionId, stepId) => {
  logger.debug('getStepContext', { executionId, stepId });

  return exports.getClient().studio.flows(flowSid)
    .executions(executionId)
    .steps(stepId)
    .stepContext()
    .fetch();
};
