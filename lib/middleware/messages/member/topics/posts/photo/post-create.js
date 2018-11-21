'use strict';

const DraftSubmission = require('../../../../../../../app/models/DraftSubmission');
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
      const imageFile = await helpers.util.fetchImageFileFromUrl(values.url);

      const createPostRes = await helpers.user.createPhotoPost(req.user, {
        campaignId: req.topic.campaign.id,
        campaignRunId: req.topic.campaign.currentCampaignRun.id,
        file: imageFile,
        quantity: values.quantity,
        source: req.platform,
        text: values.caption,
        // TODO: Only send if values.whyParticipated defined.
        whyParticipated: values.whyParticipated,
      });

      logger.debug('created post', { id: createPostRes.data.id });

      await DraftSubmission.deleteOne({ _id: req.draftSubmission._id });

      return await helpers.replies.completedPhotoPost(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
