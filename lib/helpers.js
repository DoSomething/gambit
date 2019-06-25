'use strict';

const { STATUS_CODES } = require('http');

const logger = require('./logger');
const responseHelperConfig = require('../config/lib/helpers/response');
const helpers = require('./helpers/index');
const RateLimitedError = require('../app/exceptions/RateLimitedError');


// register helpers
Object.keys(helpers).forEach((helperName) => {
  module.exports[helperName] = helpers[helperName];
});

// TODO: Move functions below into lib/helpers/response.js

/**
 * Sends response with err code and message.
 *
 * @param  {Response} res
 * @param  {Error} err
 * @param  {Boolean} retry by default, errors should be retried by Blink
 */
module.exports.sendErrorResponse = function (res, err, retry = true) {
  const error = helpers.util.parseStatusAndMessageFromError(err);

  if (!retry) {
    exports.addNoRetryHeaders(res);
  }
  return exports.sendResponseWithStatusCode(res, error.status, error.message);
};

module.exports.sendErrorResponseWithNoRetry = function (res, err) {
  return exports.sendErrorResponse(res, err, false);
};

module.exports.sendRateLimitedResponse = function (res, rateLimiterRes = {}) {
  const error = new RateLimitedError();
  // sets rate limiting headers
  res.set({
    'Retry-After': rateLimiterRes.msBeforeNext / 1000,
    // TODO: 'X-RateLimit-Limit': points,
    // points are theoretically unique per rate-limiter so this should be injected
    'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
    'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
  });
  return exports.sendErrorResponseWithNoRetry(res, error);
};

/**
 * Sends response with custom status code and message
 *
 * @param  {Response} res
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
 * @param {Request} req
 * @param {Message} message
 */
module.exports.sendResponseWithMessage = function (res, message) {
  logger.debug('sendResponseWithMessage', { messageId: message.id }, res);
  const data = { messages: [message] };

  return res.send({ data });
};

/**
 * Adds headers to the response that signal our message broker no to retry this request
 *
 * @param  {Response} res The response object
 * @return {Response}     Response
 */
module.exports.addNoRetryHeaders = function addNoRetryHeaders(res) {
  logger.debug('Adding Blink suppress headers', {}, res);
  return res.setHeader(responseHelperConfig.noRetryHeader, true);
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
  sendRateLimitedResponse: helpers.analytics
    .getErrorNoticeableMethod(module.exports.sendRateLimitedResponse),
};
