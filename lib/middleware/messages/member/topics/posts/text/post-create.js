'use strict';

const helpers = require('../../../../../../helpers');
const logger = require('../../../../../../logger');

module.exports = function createTextPost() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isTextPostConfig(req.topic)) {
        return next();
      }

      if (!helpers.util.isValidTextFieldValue(req.inboundMessageText)) {
        return helpers.replies.invalidText(req, res);
      }

      const createPostRes = await helpers.user.createTextPost({
        userId: req.user.id,
        actionId: req.topic.actionId,
        textPostSource: req.platform,
        textPostText: req.inboundMessageText,
        location: req.platformUserStateISOCode,
      });
      logger.debug('created post', { id: createPostRes.data.id });

      return await helpers.replies.completedTextPost(req, res);
    } catch (error) {
      /**
       * Manual misconfiguration of topics can result in errors when
       * submitting text posts to Rogue. We must notice these errors in
       * NewRelic
       */
      return helpers.errorNoticeable.sendErrorResponse(res, error);
    }
  };
};
