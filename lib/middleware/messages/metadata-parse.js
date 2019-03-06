'use strict';

const deepExtend = require('deep-extend');

const helpers = require('../../helpers');
const logger = require('../../logger');
const config = require('../../../config/lib/middleware/metadata-parse');

function parseRetryCount(req) {
  const retryCount = helpers.metadata.getRetryCountFromReq(req);
  if (retryCount) {
    req.metadata[config.metadata.keys.retryCount] = retryCount;
    helpers.analytics.addCustomAttributes({ retryCount });
  }
  helpers.metadata.registerIsARetryRequestFunction(req);
}

function parseRequestId(req, res) {
  const requestId = helpers.metadata.getRequestIdFromReq(req);
  req.metadata[config.metadata.keys.requestId] = requestId;
  res.set(config.metadata.headers.requestId, requestId);
  helpers.analytics.addCustomAttributes({ requestId });
}

function setGlobalProperties(req, res) {
  const metadata = {};
  const messageDataSchema = {
    attachments: [],
  };
  // Using deepExtend instead of Object.assign here to make a value copy of messageDataSchema.
  const inbound = deepExtend({}, messageDataSchema);
  const outbound = deepExtend({}, messageDataSchema);

  // req.metadata and res.metadata is a reference to the metadata object.
  req.metadata = metadata;
  res.metadata = metadata;

  // req.inbound and res.inbound is a reference to the inbound object.
  req.inbound = inbound;
  res.inbound = inbound;

  // req.outbound and res.outbound is a reference to the outbound object.
  req.outbound = outbound;
  res.outbound = outbound;

  req.attachments = {
    inbound: [],
    outbound: [],
  };
}
/**
 * parseMetadata -  Parses properties that are relevant in the context of all requests. Otherwise,
 *                  please implement middleware specific parser.
 *
 * @return {type}  description
 */
module.exports = function parseMetadata() {
  return (req, res, next) => {
    setGlobalProperties(req, res);
    parseRequestId(req, res);
    parseRetryCount(req);
    logger.debug('Parsed Metadata', {}, req);
    return next();
  };
};
