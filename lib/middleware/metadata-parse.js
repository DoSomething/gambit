'use strict';

const logger = require('heroku-logger');

function parseRetryCount(req) {
  const retryCountFromHeader = Number(req.get('x-blink-retry-count')) || 0;
  const retryCountFromQuery = Number(req.query['x-blink-retry-count']) || 0;
  const retryCount = retryCountFromHeader || retryCountFromQuery || 0;

  if (retryCount) {
    req.metadata.retryCount = retryCount;
    logger.info('Blink retry count', { retryCount });
  }
}

function parseRequestId(req) {
  const requestIdFromHeader = req.get('x-request-id');
  const requestIdFromQuery = req.query['x-request-id'];
  const requestId = requestIdFromHeader || requestIdFromQuery;

  if (requestId) {
    req.metadata.requestId = requestId;
    logger.info('Request ID', { requestId });
  }
}

module.exports = function parseMetadata() {
  return (req, res, next) => {
    req.metadata = {};
    parseRetryCount(req);
    parseRequestId(req);
    return next();
  };
};
