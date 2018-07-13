'use strict';

const helpers = require('../../../helpers');

module.exports = function getBroadcast() {
  return (req, res, next) => helpers.broadcast.fetchById(req.broadcastId)
    .then((broadcast) => {
      req.broadcast = broadcast;
      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
