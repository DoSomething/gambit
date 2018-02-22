'use strict';

const contentful = require('../contentful');
const logger = require('../logger');
const Message = require('../../app/models/Message');

const config = require('../../config/lib/helpers/broadcast');

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
    To: config.customerIo.userPhoneField,
    Body: req.data.message,

    /**
     * This property is only used in Blink to determine the broadcastId.
     * It's essentially a hack, but for now it's OK until v1 is deprecated.
     */
    StatusCallback: module.exports.getStatusCallbackUrl(req.broadcastId),
  };
}

/**
 * getWebhookBodyForBroadcastId
 *
 * @param {string} broadcastId
 * @return {object}
 *
 * Returns the body of the POST request to Conversations /v2/messages?origin=broadcast.
 */
function getWebhookBodyForBroadcastId(broadcastId) {
  return {
    northstarId: config.customerIo.userIdField,
    broadcastId,
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
   * @param {object} broadcastObject
   * @return {object}
   */
  parseBroadcast: function parseBroadcast(broadcastObject) {
    const templates = config.default.templates;
    const result = {
      id: broadcastObject.sys.id,
      name: broadcastObject.fields.name,
      createdAt: broadcastObject.sys.createdAt,
      updatedAt: broadcastObject.sys.updatedAt,
      message: contentful.getMessageTextFromBroadcast(broadcastObject),
      topic: contentful.getTopicFromBroadcast(broadcastObject),
      campaignId: contentful.getCampaignIdFromBroadcast(broadcastObject),
      template: contentful.getMessageTemplateFromBroadcast(broadcastObject) || templates.campaign,
    };
    if (result.topic) {
      result.template = templates.topic;
    }

    return result;
  },
  /**
   * @param {boolean} useApiVersion2
   * @return {object}
   */
  getWebhook: function getWebhook(useApiVersion2, req) {
    const data = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // TODO: Remove when we're ready to deprecate v1.
    if (!useApiVersion2) {
      data.url = config.blink.v1WebhookUrl;
      data.body = getV1WebhookBody(req);
      return data;
    }

    data.url = config.blink.webhookUrl;
    data.body = getWebhookBodyForBroadcastId(req.broadcastId);
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
  formatStats,
  parseMessageDirection,
};
