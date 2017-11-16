'use strict';

const logger = require('../logger');
const uuidV4 = require('uuid/v4');

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
 * parseMetadata - Here we parse global properties. All requests to Conversations API will run
 * through this middleware. Most parsing should be done at the specific route's middleware.
 * You should have a good reason to parse it here.
 *
 * @return {type}  description
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
    return next();
  };
};
