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
      logger.debug('parsing askMultipleChoice response for broadcast topic', {
        id: broadcastTopic.id,
      });

      await helpers.request.parseAskMultipleChoiceResponse(req);

      const template = req.macro;
      const choiceTopic = broadcastTopic[`${template}Topic`];
      if (choiceTopic) {
        await helpers.request.executeInboundTopicChange(req, choiceTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic[template], template);
      }
      // If the topic does not contain the macro choice (in case of optional choices)
      // respond with invalid message
      return helpers.replies
        .sendReply(req, res, broadcastTopic.invalidAskMultipleChoiceResponse, req.macro);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
