'use strict';

const helpers = require('../../../helpers');

module.exports = function changeTopicMacro() {
  return (req, res, next) => {
    try {
      if (!helpers.macro.isChangeTopic(req.macro)) {
        return next();
      }
      // Placeholder for testing.
      return helpers.replies.noCampaign(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
