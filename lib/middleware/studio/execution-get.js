'use strict';

const twilio = require('../../twilio');
const helpers = require('../../helpers');

module.exports = function getExecutionSteps() {
  return async (req, res) => {
    try {
      const executionId = req.params.executionId;

      const data = await twilio.getExecutionSteps(executionId);

      for (const step of data) {
        const stepContext = await twilio.getStepContext(executionId, step.sid);

        step.context = stepContext.context;
      }

      return res.send({ data });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
