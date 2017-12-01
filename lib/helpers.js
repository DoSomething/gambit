'use strict';

const logger = require('./logger');
const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');

const config = require('../config/lib/helpers');
const helpers = require('./helpers/index');
const InternalServerError = require('../app/exceptions/InternalServerError');

// TODO: Move contents of this helper.js file into lib/helpers/index.js or to modular helpers

// register helpers
Object.keys(helpers).forEach((helperName) => {
  module.exports[helperName] = helpers[helperName];
});

module.exports.isConfirmedCampaignMacro = function (text) {
  return (text === config.macros.confirmedCampaign);
};

module.exports.isDeclinedCampaignMacro = function (text) {
  return (text === config.macros.declinedCampaign);
};

module.exports.isMacro = function (text) {
  const result = config.macros[text];
  logger.debug('isMacro', { text, result });

  return result;
};

module.exports.isMenuCommand = function (text = '') {
  return (text.toLowerCase() === config.menuCommand);
};

module.exports.isSendCrisisMessageMacro = function (text) {
  return (text === config.macros.sendCrisisMessage);
};

module.exports.isSendInfoMessageMacro = function (text) {
  return (text === config.macros.sendInfoMessage);
};

module.exports.isSubscriptionStatusLessMacro = function (text) {
  return (text === config.macros.subscriptionStatusLess);
};

module.exports.isSubscriptionStatusStopMacro = function (text) {
  return (text === config.macros.subscriptionStatusStop);
};

module.exports.isSupportRequestedMacro = function (text) {
  return (text === config.macros.supportRequested);
};

function getSubscriptionStatusValueForKey(key) {
  return config.subscriptionStatusValues[key];
}

module.exports.subscriptionStatusActiveValue = function () {
  return getSubscriptionStatusValueForKey('active');
};

module.exports.subscriptionStatusLessValue = function () {
  return getSubscriptionStatusValueForKey('less');
};

module.exports.subscriptionStatusStopValue = function () {
  return getSubscriptionStatusValueForKey('stop');
};

/**
 * Sends response with err code and message.
 *
 * @param  {Object} res
 * @param  {Error} err
 */
module.exports.sendErrorResponse = function (res, err) {
  const error = err || new InternalServerError();

  const status = error.status || 500;
  const message = error.message || error.toString();

  /**
   * If the error has a response and the response contain the Blink Suppress headers,
   * this error is being relayed to Blink from Campaigns through Conversations.
   * We have to also relay the Suppress headers.
   */
  if (error.response && error.response.get && error.response.get(config.blinkSupressHeaders)) {
    exports.addBlinkSuppressHeaders(res);
  }

  return this.sendResponseWithStatusCode(res, status, message);
};

/**
 * Sends response with custom status code and message
 *
 * @param  {Object} res
 * @param  {Number} code = 200
 * @param  {String} message = 'OK'
 */
module.exports.sendResponseWithStatusCode = function (res, code = 200, message = 'OK') {
  const response = { message };
  if (code < 400) {
    logger.debug('sendResponseWithStatusCode', { code, response }, res);
  } else {
    logger.error('sendResponseWithStatusCode', { code, response }, res);
  }
  helpers.analytics.addParameters({ gambitApiResponseMessage: message });

  return res.status(code).send(response);
};

/**
 * Sends response with Message.
 * @param {object} req
 * @param {Message} message
 */
module.exports.sendResponseWithMessage = function (res, message) {
  logger.debug('sendResponseWithMessage', { messageId: message.id }, res);

  const data = { messages: [message] };

  return res.send({ data });
};

/**
 * addBlinkSuppressHeaders
 *
 * @param  {object} res The response object
 * @return {object}     Response
 */
module.exports.addBlinkSuppressHeaders = function addBlinkSuppressHeaders(res) {
  logger.trace('Adding Blink supress headers', {}, res);
  return res.setHeader('x-blink-retry-suppress', true);
};

module.exports.formatMobileNumber = function formatMobileNumber(mobile, format = 'E164', countryCode = 'US') {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumberObject = phoneUtil.parse(mobile, countryCode);
  return phoneUtil.format(phoneNumberObject, PhoneNumberFormat[format]);
};
