'use strict';

const helpers = require('../../../../../../helpers');
const logger = require('../../../../../../logger');

module.exports = function createPhotoPost() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (!req.draftSubmission) {
        throw new Error('req.draftSubmission undefined');
      }

      const createPostRes = await helpers.user
        .createPhotoPost(req.user, req.topic.campaign, req.platform, req.draftSubmission.values);

      logger.debug('created post', { id: createPostRes.data.id });

      await helpers.request.deleteDraftSubmission(req);

      return await helpers.replies.completedPhotoPost(req, res);
    } catch (err) {
      // TODO: Prompt user to send a diffferent photo if Rogue returns error for image file size.
      return helpers.sendErrorResponse(res, err);
    }
  };
};
