'use strict';

const { STATUS_CODES } = require('http');

const logger = require('./logger');
const config = require('../config/lib/helpers');
const helpers = require('./helpers/index');


// register helpers
Object.keys(helpers).forEach((helperName) => {
  module.exports[helperName] = helpers[helperName];
});

// TODO: Move functions below into lib/helpers/response.js

/**
 * Sends response with err code and message.
 *
 * @param  {Object} res
 * @param  {Error} err
 * @param  {Boolean} retry by default, errors should be retried by Blink
 */
module.exports.sendErrorResponse = function (res, err, retry = true) {
  const error = helpers.util.parseStatusAndMessageFromError(err);
  /**
   * If the error has a response and the response contains the Blink Suppress headers,
   * this error is being relayed to Blink from a network request through Conversations.
   * We have to also relay the Suppress headers.
   */
  const errHasResponseGet = error.response && error.response.get;
  if (!retry) {
    exports.addBlinkSuppressHeaders(res);
  /**
   * TODO: deprecate? this check is here because we used to relay errors from G-Campaigns
   * but since we are deprecating it, we could remove this extra check.
   */
  } else if (errHasResponseGet && error.response.get(config.blinkSuppressHeaders)) {
    exports.addBlinkSuppressHeaders(res);
  }

  return this.sendResponseWithStatusCode(res, error.status, error.message);
};

module.exports.sendErrorResponseWithNoRetry = function (res, err) {
  return exports.sendErrorResponse(res, err, false);
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

/**
 * Adds error noticeable versions of the most used response helpers. These methods are decorated
 * so that they will notice the error to NewRelic.
 * They exist so we can have flexibility to respond with an error but not log it in New relic. Like
 * Mobile not found errors in the ?origin=signup route.
 */
module.exports.errorNoticeable = {
  sendErrorResponseWithNoRetry: helpers.analytics
    .getErrorNoticeableMethod(module.exports.sendErrorResponseWithNoRetry),
  sendErrorResponse: helpers.analytics
    .getErrorNoticeableMethod(module.exports.sendErrorResponse),
};
