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

      const values = req.draftSubmission.values;

      const createPostRes = await helpers.user.createPhotoPost(req.user, {
        campaignId: req.topic.campaign.id,
        campaignRunId: req.topic.campaign.currentCampaignRun.id,
        file: await helpers.util.fetchImageFileFromUrl(values.url),
        quantity: values.quantity,
        source: req.platform,
        text: values.caption,
        whyParticipated: values.whyParticipated,
      });

      logger.debug('created post', { id: createPostRes.data.id });

      await helpers.request.deleteDraftSubmission(req);

      return await helpers.replies.completedPhotoPost(req, res);
    } catch (err) {
      // TODO: Prompt user to send a diffferent photo if Rogue returns error for image file size.
      return helpers.sendErrorResponse(res, err);
    }
  };
};
