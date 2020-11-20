'use strict';
const logger = require('../../logger');
const helpers = require('../../helpers');

module.exports = function sendBroadcast() {
  return async (req, res) => {
    try {
      const { broadcastId } = req.body;

      const data = await helpers.broadcast.getById(broadcastId);

      return res.send({ data });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
