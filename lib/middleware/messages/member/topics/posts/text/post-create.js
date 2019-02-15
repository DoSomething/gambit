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

      const createPostRes = await helpers.user
        .createTextPost(req.user, req.topic.campaign, req.platform, req.inboundMessageText);

      logger.debug('created post', { id: createPostRes.data.id });

      return await helpers.replies.completedTextPost(req, res);
    } catch (err) {
      /**
       * Expose create text post errors in NewRelic.
       */
      return helpers.errorNoticeable.sendErrorResponse(res, err);
    }
  };
};
