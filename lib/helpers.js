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

/**
 * Sends response with err code and message.
 *
 * @param  {Object} res
 * @param  {Error} err
 * @param  {Boolean} sendSuppressHeader
 */
module.exports.sendErrorResponse = function (res, err, sendSuppressHeader = false) {
  const error = err || new InternalServerError();

  const status = error.status || 500;
  const message = error.message || error.toString();

  /**
   * If the error has a response and the response contain the Blink Suppress headers,
   * this error is being relayed to Blink from Campaigns through Conversations.
   * We have to also relay the Suppress headers.
   */
  const errHasResponseGet = error.response && error.response.get;
  if (sendSuppressHeader) {
    exports.addBlinkSuppressHeaders(res);
  } else if (errHasResponseGet && error.response.get(config.blinkSupressHeaders)) {
    exports.addBlinkSuppressHeaders(res);
  }

  return this.sendResponseWithStatusCode(res, status, message);
};

module.exports.sendErrorResponseWithSuppressHeaders = function (res, err) {
  return exports.sendErrorResponse(res, err, true);
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
  logger.debug('formatMobileNumber params', { mobile });
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumberObject = phoneUtil.parse(mobile, countryCode);
  if (!phoneUtil.isValidNumber(phoneNumberObject)) {
    throw Error('Invalid mobile number.');
  }
  const result = phoneUtil.format(phoneNumberObject, PhoneNumberFormat[format]);
  logger.debug('formatMobileNumber return', { result });
  return result;
};
