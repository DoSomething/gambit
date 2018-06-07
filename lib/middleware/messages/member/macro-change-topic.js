'use strict';

const helpers = require('../../../helpers');

module.exports = function changeTopicMacro() {
  return (req, res, next) => {
    try {
      if (req.macro && helpers.macro.isChangeTopic(req.macro)) {
        // Placeholder for testing.
        return helpers.replies.noCampaign(req, res);
      }
      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
