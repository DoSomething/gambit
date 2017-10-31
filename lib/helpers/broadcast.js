'use strict';

const underscore = require('underscore');

const config = require('../../config/lib/helpers/broadcast');
const twilio = require('./twilio');
const helpers = require('../helpers');

function getBroadcastId(req) {
  return req.body.broadcastId || req.query.broadcastId || req.params.broadcastId;
}

/**
 * getUserPhoneField - Used for testing purposes only. Not documented.
 *
 * @param  {object} req
 * @return {type}
 */
function getUserPhoneField(req) {
  const mobile = req.body.userPhoneField || req.query.userPhoneField;

  if (mobile) {
    return helpers.formatMobileNumber(mobile);
  }
  return mobile;
}

/**
 * encodeBody - It preserves Liquid tags integrity while uri encoding all characters included
 *              in the native encodeURIComponent implementation
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 * @param  {string} text
 * @return {string}
 */
function encodeBody(text) {
  let parsedText = text;
  let uriEncodedText = '';

  // Find all Liquid tags in the text
  const liquidTags = parsedText.match(/(?:{|{{)[^{]+(?:}|}})/g);

  // If no Liquid tags found just return uri encoded text
  if (!liquidTags) {
    return encodeURIComponent(parsedText);
  }

  // use placeholders prior to uri encode all text
  liquidTags.forEach((tag, idx) => {
    parsedText = parsedText.replace(tag, `___tag${idx}___`);
  });

  // uri encode
  uriEncodedText = encodeURIComponent(parsedText);

  // Replace placeholders with matched Liquid tags
  liquidTags.forEach((tag, idx) => {
    uriEncodedText = uriEncodedText.replace(`___tag${idx}___`, tag);
  });

  return uriEncodedText;
}
/**
 * getWebhookBody
 *
 * @param  {string} message        The content the user will receive
 * @param  {string} broadcastId The broadcastId associated with this message
 * @return {string}             The body of the POST request to Twilio as a string
 * @see https://www.twilio.com/docs/api/messaging/send-messages
 */
function getWebhookBody(req) {
  const tokens = [];
  tokens.push(`To=${req.userPhoneField || config.customerIo.userPhoneField}`);
  tokens.push(`Body=${encodeBody(req.broadcastObject.fields.message)}`);

  if (req.useTwilioTestCredentials) {
    tokens.push(`From=${config.twilio.testCredentialsFromNumber}`);
  } else {
    tokens.push(`MessagingServiceSid=${twilio.getMessageServiceSid()}`);
  }
  tokens.push(`StatusCallback=${twilio.getStatusCallbackUrl(req.broadcastId)}`);
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

    /**
     * Inspect baseUrl to check if it's an broadcasr settings request
     * @see http://expressjs.com/en/api.html#req.baseUrl
     */
    if (req.baseUrl.indexOf('broadcast-settings') >= 0) {
      req.userPhoneField = getUserPhoneField(req);
    }
  },
  getSettings: function getSettings(req) {
    return {
      broadcast: underscore.omit(req.broadcastObject.fields, ['campaign']),
      campaign: req.broadcastObject.fields.campaign.fields,
      webhook: {
        url: twilio.getMessagesListResourceUrl(req.useTwilioTestCredentials),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: getWebhookBody(req),
        statusCallbackUrl: twilio.getStatusCallbackUrl(req.broadcastId, false),
      },
    };
  },
};
