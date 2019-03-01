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

      const createPostRes = await helpers.user.createPhotoPost({
        userId: req.user.id,
        campaignId: req.topic.campaign.id,
        actionId: req.topic.actionId,
        photoPostSource: req.platform,
        photoPostValues: req.draftSubmission.values,
      });
      logger.debug('created post', { id: createPostRes.data.id });

      try {
        await helpers.request.deleteDraftSubmission(req);
      } catch (error) {
        // Exposed as info for monitoring
        logger.info('Draft Submission was unable to be deleted.', { _id: req.draftSubmission._id });
        helpers.analytics.addHandledError(error);
      }

      return await helpers.replies.completedPhotoPost(req, res);
    } catch (error) {
      /**
       * TODO: Prompt user to send a different photo if Rogue returns error for image file size.
       *
       * Manual misconfiguration of topics can result in errors when
       * submitting text posts to Rogue. We must notice this errors in
       * NewRelic
       */
      return helpers.errorNoticeable.sendErrorResponse(res, error);
    }
  };
};
