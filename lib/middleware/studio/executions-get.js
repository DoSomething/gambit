'use strict';

const twilio = require('../../twilio');
const helpers = require('../../helpers');

module.exports = function getExecutions() {
  return async (req, res) => {
    try {
      const data = await twilio.getExecutions();

      return res.send({ data });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
