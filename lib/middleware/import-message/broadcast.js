'use strict';

const Promise = require('bluebird');
const Cacheman = require('cacheman');
const logger = require('heroku-logger');

const config = require('../../../config/lib/middleware/import-message/broadcast');

const cache = new Cacheman('broadcasts', { ttl: config.cacheTtl });

const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

// TODO: Move inside lib/contentful
function getCampaignId(broadcastObject) {
  const campaign = broadcastObject.fields.campaign;
  if (!campaign.fields) {
    return null;
  }
  return campaign.fields.campaignId;
}

// TODO: Move inside lib/contentful
function getTopic(broadcastObject) {
  return broadcastObject.fields.topic;
}

// TODO: Move inside lib/contentful
function getMessage(broadcastObject) {
  return broadcastObject.fields.message;
}

// TODO: Move inside lib/contentful
function parsePropertiesFromBroadcast(req, res, broadcast) {
  let promise;
  if (broadcast) {
    promise = Promise.resolve(broadcast);
  } else {
    promise = new Promise((resolve, reject) => {
      helpers.getBroadcast(req, res)
        .then((broadcastObj) => {
          cache.set(req.broadcastId, broadcastObj)
            .then((cachedBroadcast) => {
              resolve(cachedBroadcast);
            })
            .catch(error => reject(error));
        });
    });
  }

  return promise
    .then((cachedBroadcast) => {
      req.topic = getTopic(cachedBroadcast);
      req.campaignId = getCampaignId(cachedBroadcast);
      req.outboundMessageText = getMessage(cachedBroadcast);
      return cachedBroadcast;
    });
}

module.exports = function getBroadcast() {
  return (req, res, next) => {
    const asyncProperties = [];

    // We only import messages sent in broadcasts. For this reason, broadcastId must be
    // a required field. If in the future we want to allow generic imports we can relax
    // this requirement here and call next()
    if (!req.broadcastId) {
      const error = new UnprocessibleEntityError('broadcastId is a required property.');
      return helpers.sendErrorResponse(res, error);
    }

    return cache.get(req.broadcastId)
      .then((broadcast) => {
        if (broadcast) {
          logger.info(`Broadcasts cache hit. Broadcast id: ${req.broadcastId}`);
          asyncProperties.push(parsePropertiesFromBroadcast(req, res, broadcast));
        } else {
          logger.info(`Broadcasts cache miss. Broadcast id: ${req.broadcastId}`);
          asyncProperties.push(parsePropertiesFromBroadcast(req, res));
        }

        // Process async parsers
        return Promise.all(asyncProperties)
          .then(() => next())
          .catch(err => helpers.sendErrorResponse(res, err));
      });
  };
};
