'use strict';

const helpers = require('../../../helpers');

module.exports = function changeTopicMacro() {
  return (req, res, next) => {
    try {
      const isChangeTopicMacro = helpers.request.isChangeTopicMacro(req);
      if (!isChangeTopicMacro) {
        return next();
      }

      return helpers.request.executeChangeTopicMacro(req)
        .then(() => helpers.replies.continueCampaign(req, res))
        .catch(err => helpers.sendErrorResponse(res, err));
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
