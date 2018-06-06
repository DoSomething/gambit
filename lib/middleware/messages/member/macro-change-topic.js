'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function changeTopicMacro() {
  return (req, res, next) => {
    try {
      const isChangeTopicMacro = helpers.request.isChangeTopicMacro(req);
      logger.debug('isChangeTopicMacro', { result: isChangeTopicMacro });
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
