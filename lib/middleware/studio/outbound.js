'use strict';

const logger = require('../../logger');
const twilio = require('../../twilio');
const helpers = require('../../helpers');

module.exports = function sendBroadcast() {
  return async (req, res) => {
    try {
      const { broadcastId, to } = req.body;

      const data = await helpers.broadcast.getById(broadcastId);

      // TODO: Throw error if user is unsubscribed.

      // TODO: Save user conversation topic.

      /**
       * TODO: Check if an active execution exists for this number. If so, end it before creating
       * a new execution to avoid errors.
       * @see https://www.twilio.com/docs/studio/rest-api/v2/execution?code-sample=code-end-an-active-execution&code-language=Node.js&code-sdk-version=3.x
       */
      await twilio.createExecution(to, data.text);

      return res.send({ data });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
