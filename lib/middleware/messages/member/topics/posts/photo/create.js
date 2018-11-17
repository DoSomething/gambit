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

      // TODO: Fetch file from url property to submit a photo post.
      const createPostRes = await helpers.user.createTextPost(req.user, {
        campaignId: req.topic.campaign.id,
        campaignRunId: req.topic.campaign.currentCampaignRun.id,
        text: JSON.stringify(req.draftSubmission.toObject().values),
        source: req.platform,
      });
      logger.debug('created post', { id: createPostRes.data.id });

      await DraftSubmission.deleteOne({ _id: req.draftSubmission._id });

      return await helpers.replies.completedPhotoPost(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
