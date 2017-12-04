'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');

const broadcastHelper = helpers.broadcast;

module.exports = function countMessages() {
  return (req, res, next) => {
    logger.info('Counting outbound messsages for Broadcast', { broadcastId: req.broadcastId }, req);
    const broadcastId = req.broadcastId;
    req.totals = {};

    return broadcastHelper.getMessageCount(broadcastId, 'outbound-api-import')
      .then((count) => {
        req.totals.outbound = count;
        return broadcastHelper.getMessageCount(broadcastId, 'inbound');
      })
      .then((count) => {
        req.totals.inbound = count;
        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
