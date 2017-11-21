'use strict';

const Cacheman = require('cacheman');
const logger = require('../../logger');

const config = require('../../../config/lib/middleware/import-message/broadcast');

const cache = new Cacheman('broadcasts', { ttl: config.cacheTtl });

const helpers = require('../../helpers');
const contentful = require('../../contentful');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function getBroadcast() {
  return (req, res, next) => {
    const broadcastId = req.broadcastId;

    // We only import messages sent in broadcasts. For this reason, broadcastId must be
    // a required field. If in the future we want to allow generic imports we can relax
    // this requirement here and call next()
    if (!broadcastId) {
      const error = new UnprocessibleEntityError('broadcastId is a required property.');
      return helpers.sendErrorResponse(res, error);
    }
    helpers.analytics.addParameters({ broadcastId });

    return cache.get(broadcastId)
      .then((broadcast) => {
        if (broadcast) {
          logger.debug('Broadcasts cache hit', { broadcastId: req.broadcastId }, req);
          req.broadcast = broadcast;
          return next();
        }

        logger.debug('Broadcasts cache miss', { broadcastId: req.broadcastId }, req);
        return contentful.fetchBroadcast(broadcastId)
          .then((broadcastObj) => {
            logger.debug('contentful.fetchBroadcast success', { broadcastId }, req);
            return cache.set(broadcastId, broadcastObj)
              .then((cachedBroadcast) => {
                req.broadcast = cachedBroadcast;
                return next();
              });
          })
          .catch(err => helpers.sendErrorResponse(res, err));
      });
  };
};
