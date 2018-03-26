'use strict';

const helpers = require('../../../helpers');

module.exports.hasDeliveryMetadata = function hasDeliveryMetadata(body) {
  return body.metadata && body.metadata.delivery;
};

module.exports.parseDeliveryMetadataProperties = function parseDeliveryMetadataProperties(req) {
  const queuedAt = req.body.metadata.delivery.queuedAt;
  const deliveredAt = req.body.metadata.delivery.deliveredAt;
  const failedAt = req.body.metadata.delivery.failedAt;
  const failureData = req.body.metadata.delivery.failureData;
  req.deliveryStatusUpdate = !!(queuedAt || deliveredAt || failedAt);
  req.deliveryFailureData = failureData;

  if (req.deliveryFailureData && req.deliveryFailureData.code) {
    req.undeliverableError = helpers.twilio.isUndeliverableError(req.deliveryFailureData.code);
    helpers.analytics.addCustomAttributes({
      failureData,
      undeliverableError: req.undeliverableError,
    });
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
