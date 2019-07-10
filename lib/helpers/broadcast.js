'use strict';

const graphql = require('../graphql');
const helpers = require('../helpers');
const logger = require('../logger');
const Message = require('../../app/models/Message');

const config = require('../../config/lib/helpers/broadcast');

/**
 * Transforms GraphQL response to be compatible with the legacy contract.
 * @param {Topic} topic
 */
const broadcastTransformer = (topic) => {
  // TODO: Refactor codebase to check for the topic GraphQL __typename, not the Contentful type name
  topic.type = topic.contentType; // eslint-disable-line

  let transformedBroadcast = topic;

  if (module.exports.isAskVotingPlanStatus(topic)) {
    transformedBroadcast = {
      ...topic,
      saidVotedTopic: topic.saidVotedTransition.topic,
    };
  }
  if (module.exports.isAskYesNo(topic)) {
    transformedBroadcast = {
      ...topic,
      saidYesTopic: topic.saidYesTransition.topic,
    };
  }
  return transformedBroadcast;
};

/**
 * @param {String} id
 * @return {Promise}
 */
async function fetchById(id) {
  logger.debug('Fetching broadcast', { id });

  const broadcast = broadcastTransformer(await graphql.fetchBroadcastById(id));

  return helpers.cache.broadcasts.set(id, broadcast);
}

/**
 * @param {String} id
 * @return {Promise}
 */
async function getById(id) {
  const broadcast = await helpers.cache.broadcasts.get(id);

  if (broadcast) {
    logger.debug('Broadcast cache hit', { id });
    return broadcast;
  }

  logger.debug('Topic cache miss', { id });
  return module.exports.fetchById(id);
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
function isAskVotingPlanStatus(broadcast) {
  return broadcast.contentType === config.types.askVotingPlanStatus;
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
  fetchById,
  getById,
  isAskSubscriptionStatus,
  isAskYesNo,
  isAskVotingPlanStatus,
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
