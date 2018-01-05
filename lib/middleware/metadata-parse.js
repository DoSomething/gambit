'use strict';

const uuidV4 = require('uuid/v4');
const Promise = require('bluebird');

const logger = require('../logger');
const helpers = require('../helpers');

function parseRetryCount(req) {
  const retryCountFromHeader = Number(req.get('x-blink-retry-count')) || 0;
  const retryCountFromQuery = Number(req.query['x-blink-retry-count']) || 0;
  const retryCount = retryCountFromHeader || retryCountFromQuery || 0;

  if (retryCount) {
    req.metadata.retryCount = retryCount;
    logger.info('Blink retry count', { retryCount }, req);
  }
}

function parseRequestId(req, res) {
  const requestIdFromHeader = req.get('x-request-id');
  const requestIdFromQuery = req.query['x-request-id'];
  const requestId = requestIdFromHeader || requestIdFromQuery || uuidV4();

  req.metadata.requestId = requestId;
  res.metadata.requestId = requestId;
  res.set('X-Request-Id', requestId);
  logger.info('Request ID', {}, req);
}

function registerIsARetryRequestFunction(req) {
  req.isARetryRequest = () => !!req.metadata.retryCount;
}

/**
 * parseFailInjection - Used for testing purposes ONLY.
 *
 * @param  {object} req
 * @param  {object} res
 */
function parseFailInjection(req) {
  const failHeader = req.get('x-request-fail');
  const failMaxCountHeader = parseInt(req.get('x-request-fail-count'), 10);
  const isRetryRequest = req.isARetryRequest();
  const shouldFail = (failHeader && failMaxCountHeader);
  const failMsg = 'Fail injection detected. Failing request.';

  return new Promise((resolve, reject) => {
    // If a fail injection is detected
    if (shouldFail) {
      // If this request is a retry
      if (isRetryRequest) {
        // Let's make sure we are under the max fail count set
        // If it's over, the request will go through
        if (req.metadata.retryCount <= failMaxCountHeader) {
          return reject(new Error(failMsg));
        }
      // If it's not a retry, just fail the request
      } else {
        return reject(new Error(failMsg));
      }
    }

    // Don't fail the request
    return resolve();
  });
}

/**
 * parseMetadata - Here we parse global properties. All requests to Conversations API will run
 * through this middleware. Most parsing should be done at the specific route's middleware.
 * You should have a good reason to parse it here.
 */
module.exports = function parseMetadata() {
  return (req, res, next) => {
    req.metadata = {};
    res.metadata = {};
    // This is being defined at the global level to support attachments for all routes.
    req.attachments = {
      inbound: [],
      outbound: [],
    };
    parseRequestId(req, res);
    parseRetryCount(req);
    registerIsARetryRequestFunction(req);
    parseFailInjection(req)
      .then(next)
      .catch(error => helpers.sendErrorResponse(res, error));
  };
};
