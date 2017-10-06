'use strict';

const underscore = require('underscore');

const config = require('../../config/lib/helpers/broadcast');
const twilio = require('./twilio');

function getBroadcastId(req) {
  return req.body.broadcastId || req.query.broadcastId;
}
/**
 * getWebhookBody
 *
 * @param  {string} message        The content the user will receive
 * @param  {string} broadcastId The broadcastId associated with this message
 * @return {string}             The body of the POST request to Twilio as a string
 * @see https://www.twilio.com/docs/api/messaging/send-messages
 */
function getWebhookBody(message, broadcastId) {
  const tokens = [];
  tokens.push(`To=${config.customerIo.userPhoneField}`);
  tokens.push(`Body=${message}`);
  tokens.push(`MessagingServiceSid=${twilio.getMessageServiceSid()}`);
  tokens.push(`StatusCallback=${twilio.getStatusCallbackUrl(broadcastId)}`);
  return tokens.join('&');
}

/**
 * Broadcast helper
 */
module.exports = {
  /**
   * parseBody
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    req.broadcastId = getBroadcastId(req);
  },
  getSettings: function getSettings(broadcastObject, broadcastId) {
    return {
      broadcast: underscore.omit(broadcastObject.fields, ['campaign']),
      campaign: broadcastObject.fields.campaign.fields,
      webhook: {
        url: twilio.getMessagesListResourceUrl(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: getWebhookBody(broadcastObject.fields.message, broadcastId),
      },
    };
  },
};
