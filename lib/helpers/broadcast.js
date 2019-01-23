'use strict';

const gambitContent = require('../gambit-content');
const graphql = require('../graphql');
const logger = require('../logger');
const Message = require('../../app/models/Message');

const config = require('../../config/lib/helpers/broadcast');

/**
 * @param {Object} query
 * @return {Promise}
 */
function fetch(query = {}) {
  return gambitContent.fetchBroadcasts(query);
}

/**
 * @param {String} broadcastId
 * @param {Object} query
 * @return {Promise}
 */
function fetchById(broadcastId, query = {}) {
  return graphql.fetchBroadcastById(broadcastId, query);
}

/**
 * @param {Object} broadcast
 * @return {Boolean}
 */
function isAskSubscriptionStatus(broadcast) {
  return broadcast.contentType === config.types.askSubscriptionStatus;
}

/**
 * @param {Object} broadcast
 * @return {Boolean}
 */
function isAskYesNo(broadcast) {
  return broadcast.contentType === config.types.askYesNo;
}

/**
 * @param {Object} broadcast
 * @return {Boolean}
 */
function isLegacyBroadcast(broadcast) {
  return broadcast.contentType === config.types.legacy;
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
      macros: {},
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
  fetch,
  fetchById,
  isAskSubscriptionStatus,
  isAskYesNo,
  isLegacyBroadcast,
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
