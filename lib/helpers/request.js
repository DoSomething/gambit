'use strict';

/**
 * Request helper
 */
module.exports = {
  isTwilio: function isTwilio(req) {
    return !!req.body.MessageSid;
  },
  isSlack: function isSlack(req) {
    return !!req.body.slackId;
  },
  isFacebook: function isFacebook(req) {
    return !!req.body.facebookId;
  },
  isFront: function isFront(req) {
    // TODO: Should be in a config constant
    return !!req.get('x-front-signature');
  },
  isTwilioStatusCallback: function isTwilioStatusCallback(req) {
    const messageStatus = req.body.MessageStatus;

    /**
     * Twilio has received confirmation of message delivery from the upstream carrier,
     * and, where available, the destination handset.
     * @see https://www.twilio.com/docs/api/messaging/message#message-status-values
     */
    return messageStatus === 'delivered';
  },
  injectRequestId: function injectRequestId(data = {}, metadataContainer) {
    // If we don't send a data object and just a metadataContainer instead
    if (!metadataContainer && data.metadata) {
      return { request_id: data.metadata.requestId };
    }
    // If we don't send a metadataContainer and just a data object instead
    if (!metadataContainer && !data.metadata) {
      return data;
    }
    // If we send the metadataContainer in place of the data obj viceversa
    if (data && data.metadata && metadataContainer) {
      return Object.assign({ request_id: data.metadata.requestId }, metadataContainer);
    }
    // If we send a metadataContainer that does not have a metadata object property
    if (data && !data.metadata && metadataContainer && !metadataContainer.metadata) {
      return data;
    }

    return Object.assign({ request_id: metadataContainer.metadata.requestId }, data);
  },
};
