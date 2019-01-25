'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function getBroadcast() {
  return (req, res, next) => {
    logger.info('Searching for Broadcast', { broadcastId: req.broadcastId }, req);

    return helpers.broadcast.getById(req.broadcastId)
      .then((broadcast) => {
        req.data = broadcast;
        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
