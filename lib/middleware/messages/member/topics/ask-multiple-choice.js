'use strict';

const helpers = require('../../../../helpers');

module.exports = function catchAllAskMultipleChoice() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAskMultipleChoice(req.topic)) {
        return next();
      }
      const broadcastTopic = req.topic;
      const template = 'saidFirstChoice';

      return helpers.replies.sendReply(req, res, broadcastTopic[template], template);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
