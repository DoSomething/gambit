'use strict';

const helpers = require('../../helpers');

module.exports = function sendCrisisMessage() {
  return (req, res, next) => {
    try {
      if (helpers.macro.isSendCrisisMessage(req.macro)) {
        return helpers.replies.crisisMessage(req, res);
      }
      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
