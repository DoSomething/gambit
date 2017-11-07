'use strict';

const logger = require('heroku-logger');
const newrelic = require('newrelic');

/**
 * Request helper
 */
module.exports = {
  /**
   * Platform checks.
   */
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
  /**
   * New Relic.
   */
  formatNewRelicPayload: function formatNewRelicPayload(req, gambitApiResponseMessage) {
    const paramNames = ['campaignId', 'platform', 'platformUserId', 'userId'];
    const payload = {};
    paramNames.forEach((paramName) => {
      payload[paramName] = req[paramName];
    });
    if (gambitApiResponseMessage) {
      payload.gambitApiResponseMessage = gambitApiResponseMessage;
    }

    return payload;
  },
  addNewRelicParameters: function addNewRelicParameters(req, gambitApiResponseMessage) {
    const payload = this.formatNewRelicPayload(req, gambitApiResponseMessage);
    logger.debug('addNewRelicParameters', payload);
    newrelic.addCustomParameters(payload);
  },
};
