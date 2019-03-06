'use strict';

const uuidV4 = require('uuid/v4');

const config = require('../../config/lib/middleware/metadata-parse');

function getRequestIdFromReq(req) {
  const requestIdFromHeader = req.get(config.metadata.headers.requestId);
  const requestIdFromQuery = req.query[config.metadata.headers.requestId];
  return requestIdFromHeader || requestIdFromQuery || uuidV4();
}

function getRetryCountFromReq(req) {
  const retryCountFromHeader = Number(req.get(config.metadata.headers.retryCount)) || 0;
  const retryCountFromQuery = Number(req.query[config.metadata.headers.retryCount]) || 0;
  return retryCountFromHeader || retryCountFromQuery;
}

function registerIsARetryRequestFunction(req) {
  req.isARetryRequest = () => !!req.metadata[config.metadata.keys.retryCount];
}

module.exports = {
  getRequestIdFromReq,
  getRetryCountFromReq,
  registerIsARetryRequestFunction,
};
