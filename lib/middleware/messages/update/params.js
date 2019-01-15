'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports.hasDeliveryMetadata = function hasDeliveryMetadata(body) {
  return body.metadata && body.metadata.delivery;
};

module.exports.parseDeliveryMetadataProperties = function parseDeliveryMetadataProperties(req) {
  const { queuedAt, deliveredAt, failedAt, failureData } = req.body.metadata.delivery;
  req.deliveryStatusUpdate = !!(queuedAt || deliveredAt || failedAt);
  req.deliveryFailureData = failureData;

  if (req.deliveryFailureData && req.deliveryFailureData.code) {
    // TODO: Move to request helper so it sets this prop consistent w/ other middleware
    req.undeliverableError = helpers.twilio.isUndeliverableError(req.deliveryFailureData.code);
    helpers.analytics.addCustomAttributes({
      failureData,
      undeliverableError: req.undeliverableError,
    });
    // Expose to monitor message delivery failures
    logger.info('Outbound message delivery failure', {
      code: req.deliveryFailureData.code,
      messageId: req.messageId,
    }, req);
  }
};

module.exports.middleware = function middleware() {
  return (req, res, next) => {
    const messageId = req.params.messageId;
    req.messageId = messageId;

    if (exports.hasDeliveryMetadata(req.body)) {
      exports.parseDeliveryMetadataProperties(req);
    }

    helpers.analytics.addCustomAttributes({ messageId });
    return next();
  };
};
