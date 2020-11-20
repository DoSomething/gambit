'use strict';

const logger = require('../../logger');
const twilio = require('../../twilio');
const helpers = require('../../helpers');

module.exports = function sendBroadcast() {
  return async (req, res) => {
    try {
      const { broadcastId, to } = req.body;

      const data = await helpers.broadcast.getById(broadcastId);

      await twilio.createExecution(to, data.text);

      return res.send({ data });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
