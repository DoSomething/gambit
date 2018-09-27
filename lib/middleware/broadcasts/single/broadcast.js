'use strict';

const logger = require('../../../logger');

const helpers = require('../../../helpers');
// TODO: Change file name
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

function isMessageEmpty(broadcast) {
  if (!broadcast.message) {
    return true;
  }
  return !broadcast.message.text.trim();
}

module.exports = function getBroadcast() {
  return (req, res, next) => {
    logger.info('Searching for Broadcast', { broadcastId: req.broadcastId }, req);

    return helpers.broadcast.fetchById(req.broadcastId, req.query)
      .then((broadcast) => {
        // We should never be able to send an empty message to users.
        if (isMessageEmpty(broadcast)) {
          const error = new UnprocessibleEntityError('Broadcast misconfigured. Message field is required!');
          return helpers.sendErrorResponse(res, error);
        }
        req.data = broadcast;
        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
