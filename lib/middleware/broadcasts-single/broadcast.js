'use strict';

const logger = require('../../logger');

const helpers = require('../../helpers');
const contentful = require('../../contentful');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

function isMessageEmpty(broadcast) {
  if (typeof broadcast.fields.message !== 'string') {
    return true;
  }
  return !broadcast.fields.message.trim();
}

module.exports = function getBroadcast() {
  return (req, res, next) => {
    logger.info('Searching for Broadcast', { broadcastId: req.broadcastId }, req);

    return contentful.fetchBroadcast(req.broadcastId)
      .then((broadcast) => {
        // We should never be able to send an empty message to users.
        if (isMessageEmpty(broadcast)) {
          const error = new UnprocessibleEntityError('Broadcast misconfigured. Message field is required!');
          return helpers.sendErrorResponse(res, error);
        }
        req.data = helpers.broadcast.parseBroadcast(broadcast);
        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
