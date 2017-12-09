'use strict';

const Cacheman = require('cacheman');
const contentful = require('../contentful');
const helpers = require('../helpers');
const logger = require('../logger');
const Message = require('../../app/models/Message');

const config = require('../../config/lib/helpers/broadcast');

const statsCache = new Cacheman('broadcastStats', { ttl: config.statsCacheTtl });

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
 * getWebhookBody
 *
 * @param  {object} req
 * @return {object}             The body of the POST request to Twilio
 * @see https://www.twilio.com/docs/api/messaging/send-messages
 */
function getWebhookBody(req) {
  return {
    To: req.userPhoneField || config.customerIo.userPhoneField,
    Body: req.data.message,

    /**
     * TODO: This property is only used in Blink to determine the broadcastId.
     * It's essentially a hack, but for now it's OK until we refactor Broadcast logic in both
     * Blink and Convo API
     */
    StatusCallback: module.exports.getStatusCallbackUrl(req.broadcastId),
  };
}

function getTotalsForBroadcastId(broadcastId) {
  return Message.aggregate([
    { $match: { broadcastId } },
    { $group: { _id: '$direction', count: { $sum: 1 } } },
  ]);
}

function parseMessageDirection(direction) {
  if (direction === 'outbound-api-import') {
    return 'outbound';
  }
  return direction;
}

function formatTotals(data) {
  const result = {};
  data.forEach((group) => {
    const key = parseMessageDirection(group._id);
    result[key] = { total: group.count };
  });
  return result;
}

/**
 * @param {string} broadcastId
 * @return {Promise}
 */
function getStatsForBroadcastId(broadcastId) {
  const query = { broadcastId };
  return statsCache.get(broadcastId)
    .then((stats) => {
      if (stats) {
        logger.debug('broadcastStats cache hit', query);
        return stats;
      }

      logger.debug('broadcastStats cache miss', query);
      return getTotalsForBroadcastId(broadcastId)
        .then(data => formatTotals(data))
        .then(formatted => statsCache.set(broadcastId, formatted));
    });
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
      createdAt: broadcastObject.sys.createdAt,
      updatedAt: broadcastObject.sys.updatedAt,
      campaignId: contentful.getCampaignIdFromBroadcast(broadcastObject),
      topic: contentful.getTopicFromBroadcast(broadcastObject),
      message: contentful.getMessageTextFromBroadcast(broadcastObject),
    };
    return result;
  },
  getWebhook: function getWebhook(req) {
    return {
      url: `${config.blink.smsBroadcastWebhookUrl}`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: getWebhookBody(req),
    };
  },
  getStatusCallbackUrl: function getStatusCallbackUrl(broadcastId) {
    return `${config.blink.smsBroadcastWebhookUrl}?broadcastId=${broadcastId}`;
  },
  getStatsForBroadcastId,
};
