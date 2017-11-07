'use strict';

const logger = require('heroku-logger');

const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

function isMessageEmpty(broadcast) {
  if (typeof broadcast.fields.message !== 'string') {
    return true;
  }
  return !broadcast.fields.message.trim();
}

module.exports = function getBroadcast() {
  return (req, res, next) => {
    logger.info(`Searching for Broadcast: ${req.params.broadcastId}`);
    return helpers.getBroadcast(req, res)
      .then((broadcast) => {
        // We should never be able to send an empty message to users.
        if (isMessageEmpty(broadcast)) {
          const error = new UnprocessibleEntityError('Broadcast misconfigured. Message field is required!');
          return helpers.sendErrorResponse(req, res, error);
        }
        req.broadcastObject = broadcast;
        return next();
      })
      .catch(err => helpers.sendErrorResponse(req, res, err));
  };
};
