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
  injectRequestId: function injectRequestId(req, data = {}) {
    if (!req.metadata) {
      /**
       * Shortcut to return the passed log object instead if no req object is passed.
       */
      return req;
    }
    return Object.assign({ request_id: req.metadata.requestId }, data);
  },
};
