'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function getCurrentTopic() {
  /**
   * If we've made it this far - we haven't found a reply to send yet.
   * Get the current topic to determine the reply later.
   */
  return async (req, res, next) => {
    try {
      const topic = await helpers.topic.getById(req.currentTopicId);
      helpers.request.setTopic(req, topic);

      if (helpers.topic.isDeprecated(topic)) {
        logger.debug('topic is deprecated', { topicId: topic.id }, req);
        return await helpers.replies.noCampaign(req, res);
      }

      return next();
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }
  };
};
