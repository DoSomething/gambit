'use strict';

const helpers = require('../../../helpers');

module.exports = function broadcastStats() {
  return (req, res) => helpers.broadcast.aggregateMessagesForBroadcastId(req.broadcastId)
    .then((data) => {
      try {
        req.data.stats = helpers.broadcast.formatStats(data);
      } catch (err) {
        return helpers.sendErrorResponse(res, err);
      }

      return res.send({ data: req.data });
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
