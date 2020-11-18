'use strict';

const helpers = require('../../helpers');

module.exports = function inboundStudioMessage() {
  return async (req, res) => {
    try {
      await helpers.twilio.parseBody(req);

      const data = {
        mobile: req.platformUserId,
      };

      return res.send({ data });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
