'use strict';

const helpers = require('../../helpers');

module.exports = function broadcastStats() {
  return (req, res) => helpers.broadcast.aggregateMessagesForBroadcastId(req.broadcastId)
    .then((data) => {
      req.data.stats = helpers.broadcast.formatStats(data);
      return res.send({ data: req.data });
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
