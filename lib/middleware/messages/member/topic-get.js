'use strict';

const helpers = require('../../../helpers');

module.exports = function getCurrentTopic() {
  // If we've made it this far, fetch topic by ID to determine reply to send.
  return async (req, res, next) => {
    try {
      const topic = await helpers.topic.getById(req.currentTopicId);
      // Saves req.topic
      helpers.request.setTopic(req, topic);

      return next();
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }
  };
};
