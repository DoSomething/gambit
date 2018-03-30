'use strict';

const uuidV4 = require('uuid/v4');
const deepExtend = require('deep-extend');

const helpers = require('../../helpers');
const logger = require('../../logger');

function getRequestId(req) {
  const requestIdFromHeader = req.get('x-request-id');
  const requestIdFromQuery = req.query['x-request-id'];
  return requestIdFromHeader || requestIdFromQuery || uuidV4();
}

function getRetryCount(req) {
  const retryCountFromHeader = Number(req.get('x-blink-retry-count')) || 0;
  const retryCountFromQuery = Number(req.query['x-blink-retry-count']) || 0;
  return retryCountFromHeader || retryCountFromQuery || 0;
}

function parseRetryCount(req) {
  const retryCount = getRetryCount(req);
  if (retryCount) {
    req.metadata.retryCount = retryCount;

    // logging
    logger.info('Blink retry count', { retryCount }, req);
    helpers.analytics.addCustomAttributes({ retryCount });
  }
}

function parseRequestId(req, res) {
  const requestId = getRequestId(req);
  req.metadata.requestId = requestId;
  res.set('X-Request-Id', requestId);

  // logging
  logger.info('Request ID', {}, req);
  helpers.analytics.addCustomAttributes({ requestId });
}

function registerIsARetryRequestFunction(req) {
  req.isARetryRequest = () => !!req.metadata.retryCount;
}

function setGlobalProperties(req, res) {
  const metadata = {};
  const messageDataSchema = {
    attachments: [],
  };
  /**
   * Using deepExtend instead of Object.assign here to avoid nested objects in the schema from being
   * copied by reference.
   */
  const inbound = deepExtend({}, messageDataSchema);
  const outbound = deepExtend({}, messageDataSchema);

  // req and res .metadata property is a reference to a single object.
  req.metadata = metadata;
  res.metadata = metadata;

  // req and res .inbound property is a reference to a single object.
  req.inbound = inbound;
  res.inbound = inbound;

  // req and res .outbound property is a reference to a single object.
  req.outbound = outbound;
  res.outbound = outbound;

  // This is being defined at the global level to support attachments for all routes.
  // TODO: to be refactored eventually to use the .inbound and .outbound
  req.attachments = {
    inbound: [],
    outbound: [],
  };
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
    setGlobalProperties(req, res);
    parseRequestId(req, res);
    parseRetryCount(req);
    registerIsARetryRequestFunction(req);
    return next();
  };
};
