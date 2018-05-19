'use strict';

const contentful = require('../contentful');
const logger = require('../logger');
const Message = require('../../app/models/Message');

const config = require('../../config/lib/helpers/broadcast');

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
      campaignId: contentful.getCampaignIdFromCampaignReferenceOnContentfulEntry(broadcastObject),
      template: contentful.getMessageTemplateFromBroadcast(broadcastObject) || templates.campaign,
      attachments: contentful.getAttachmentsFromBroadcast(broadcastObject),
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
  getWebhook: function getWebhook(req) {
    const data = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

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
