'use strict';

const contentful = require('../contentful');
const helpers = require('../helpers');
const logger = require('../logger');
const Message = require('../../app/models/Message');

const config = require('../../config/lib/helpers/broadcast');

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
 * getV1WebhookBody
 *
 * @param  {object} req
 * @return {object}
 *
 * Returns the body of the POST request to Twilio /messages.
 * @see https://www.twilio.com/docs/api/messaging/send-messages
 */
function getV1WebhookBody(req) {
  return {
    To: req.userPhoneField || config.customerIo.userPhoneField,
    Body: req.data.message,

    /**
     * This property is only used in Blink to determine the broadcastId.
     * It's essentially a hack, but for now it's OK until v1 is deprecated.
     */
    StatusCallback: module.exports.getStatusCallbackUrl(req.broadcastId),
  };
}

/**
 * getWebhookBody
 *
 * @param  {object} req
 * @return {object}
 *
 * Returns the body of the POST request to Conversations /v2/messages?origin=broadcast.
 */
function getWebhookBody(req) {
  return {
    northstarId: config.customerIo.userIdField,
    broadcastId: req.broadcastId,
  };
}

/**
 * @param {string} direction
 * @return {string}
 */
function parseMessageDirection(direction) {
  logger.debug('parseMessageDirection', { direction });
  if (direction === 'inbound') {
    return 'inbound';
  }
  return 'outbound';
}

/**
 * @param {object} data
 * @return {object}
 */
function formatStats(data) {
  logger.debug('formatStats', { data });

  const result = {
    outbound: {
      total: 0,
    },
    inbound: {
      total: 0,
      macros: {},
    },
  };

  if (!data) {
    return result;
  }
  data.forEach((group) => {
    const groupId = group._id;
    if (!groupId) {
      return;
    }
    const count = group.count;
    const key = module.exports.parseMessageDirection(groupId.direction);
    const macro = groupId.macro;
    if (macro) {
      result[key].macros[macro] = count;
    }
    result[key].total += count;
  });

  logger.debug('formatStats', { result });

  return result;
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
     * Inspect baseUrl to check if it's a broadcast request
     * @see http://expressjs.com/en/api.html#req.baseUrl
     */
    if (req.baseUrl.indexOf('broadcasts') >= 0) {
      /**
       * Override the userPhoneField with a custom one for testing by sending a
       * userPhoneField param in the query or body of the request.
       */
      req.userPhoneField = getUserPhoneField(req);
    }
  },
  parseBroadcast: function parseBroadcast(broadcastObject) {
    const result = {
      id: broadcastObject.sys.id,
      name: broadcastObject.fields.name,
      platform: contentful.getPlatformFromBroadcast(broadcastObject) || this.getDefaultPlatform(),
      createdAt: broadcastObject.sys.createdAt,
      updatedAt: broadcastObject.sys.updatedAt,
      campaignId: contentful.getCampaignIdFromBroadcast(broadcastObject),
      topic: contentful.getTopicFromBroadcast(broadcastObject),
      message: contentful.getMessageTextFromBroadcast(broadcastObject),
    };
    return result;
  },
  getWebhook: function getWebhook(req) {
    const data = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (Number(config.currentVersion) === 1) {
      data.url = config.blink.v1WebhookUrl;
      data.body = getV1WebhookBody(req);
    } else {
      data.url = config.blink.webhookUrl;
      data.body = getWebhookBody(req);
    }
    return data;
  },
  getStatusCallbackUrl: function getStatusCallbackUrl(broadcastId) {
    return `${config.blink.smsBroadcastWebhookUrl}?broadcastId=${broadcastId}`;
  },
  aggregateMessagesForBroadcastId: function aggregateMessagesForBroadcastId(broadcastId) {
    return Message.aggregate([
      { $match: { broadcastId } },
      { $group: { _id: { direction: '$direction', macro: '$macro' }, count: { $sum: 1 } } },
    ]);
  },
  getDefaultPlatform: function getDefaultPlatform() {
    return 'sms';
  },
  formatStats,
  parseMessageDirection,
};
