'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const contentful = require('../../../contentful');

module.exports = function getBroadcast() {
  return (req, res, next) => {
    const broadcastId = req.broadcastId;

    return helpers.cache.broadcasts.get(broadcastId)
      .then((broadcast) => {
        if (broadcast) {
          logger.debug('Broadcasts cache hit', { broadcastId }, req);
          req.broadcast = broadcast;
          return next();
        }

        logger.debug('Broadcasts cache miss', { broadcastId }, req);
        return contentful.fetchBroadcast(broadcastId)
          .then((broadcastObj) => {
            logger.debug('contentful.fetchBroadcast success', { broadcastId }, req);
            return helpers.cache.broadcasts.set(broadcastId, broadcastObj)
              .then((cachedBroadcast) => {
                req.broadcast = cachedBroadcast;
                return next();
              });
          })
          .catch(err => helpers.sendErrorResponse(res, err));
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
