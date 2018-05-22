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
  return retryCountFromHeader || retryCountFromQuery || 0;
}

function registerIsARetryRequestFunction(req) {
  req.isARetryRequest = () => !!req.metadata.retryCount;
}

function getFailureInjectionTestIdFromReq(req) {
  const failureIdFromHeader = req.get(config.metadata.headers.failureInjectionTestId);
  const failureIdFromQuery = req.query[config.metadata.headers.failureInjectionTestId];
  return failureIdFromHeader || failureIdFromQuery || false;
}

function registerIsAFailureInjectionTestRequestFunction(req) {
  req.isAFailureInjectionTestRequest = () => !!req.metadata.failureInjectionTestId;
}

module.exports = {
  getRequestIdFromReq,
  getRetryCountFromReq,
  getFailureInjectionTestIdFromReq,
  registerIsARetryRequestFunction,
  registerIsAFailureInjectionTestRequestFunction,
};
