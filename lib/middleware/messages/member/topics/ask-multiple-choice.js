'use strict';

const helpers = require('../../../../helpers');
const logger = require('../../../../logger');

module.exports = function catchAllAskMultipleChoice() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAskMultipleChoice(req.topic)) {
        return next();
      }
      const broadcastTopic = req.topic;
      logger.debug('parsing askMultipleChoice response for topic', { topicId: req.topic.id });

      await helpers.request.parseAskMultipleChoiceResponse(req);

      const template = req.macro;
      const newTopic = broadcastTopic[`${template}Topic`];
      if (newTopic) {
        await helpers.request.executeInboundTopicChange(req, newTopic);
      }

      return helpers.replies.sendReply(req, res, broadcastTopic[template], template);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
