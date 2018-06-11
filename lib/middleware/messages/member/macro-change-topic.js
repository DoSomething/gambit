'use strict';

const helpers = require('../../../helpers');

module.exports = function changeTopicMacro() {
  return (req, res, next) => {
    try {
      if (!helpers.request.isChangeTopicMacro(req)) {
        return next();
      }

      return helpers.request.executeChangeTopicMacro(req)
        .then(() => helpers.replies.continueTopic(req, res))
        .catch(err => helpers.sendErrorResponse(res, err));
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
