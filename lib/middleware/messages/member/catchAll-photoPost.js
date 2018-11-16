'use strict';

const DraftSubmission = require('../../../../app/models/DraftSubmission');
const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function catchAllPhotoPost() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }
      await DraftSubmission.create({
        conversationId: req.conversation.id,
        topicId: req.topic.id,
        data: { test: 'wtf'},
      });
      const photoPostRes = await helpers.request.postCampaignActivity(req);
      logger.debug('photoPostRes response', photoPostRes, req);

      return await helpers.replies.sendReplyWithTopicTemplate(req, res, photoPostRes.replyTemplate);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
