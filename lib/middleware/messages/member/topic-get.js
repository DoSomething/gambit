'use strict';

const helpers = require('../../../helpers');

module.exports = function getCurrentTopic() {
  /**
   * If we've made it this far - we haven't found a reply to send yet.
   * Get the current topic to determine the reply later.
   */
  return (req, res, next) => helpers.topic.getById(req.currentTopicId)
    .then((topic) => {
      helpers.request.setTopic(req, topic);
      return next();
    })
    .catch(error => helpers.sendErrorResponse(res, error));
};

