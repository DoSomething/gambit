'use strict';

const { STATUS_CODES } = require('http');

const logger = require('./logger');
const config = require('../config/lib/helpers');
const helpers = require('./helpers/index');

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
  const error = helpers.util.parseStatusAndMessageFromError(err);

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

  return this.sendResponseWithStatusCode(res, error.status, error.message);
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
module.exports.sendResponseWithStatusCode = function (res, code = 200, message) {
  // @see https://nodejs.org/api/http.html#http_http_status_codes
  const responseMessage = message || STATUS_CODES[code];
  const response = {
    message: responseMessage,
  };

  // log
  const logLevel = code < 400 ? 'debug' : 'error';
  logger[logLevel]('sendResponseWithStatusCode', { code, response }, res);

  helpers.analytics.addCustomAttributes({ gambitApiResponseMessage: responseMessage });
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
  logger.debug('Adding Blink suppress headers', {}, res);
  return res.setHeader('x-blink-retry-suppress', true);
};
