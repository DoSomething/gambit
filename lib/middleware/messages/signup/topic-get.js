'use strict';

const helpers = require('../../../helpers');

module.exports = function getTopicByCampaignId() {
  return (req, res, next) => helpers.topic.fetchByCampaignId(req.campaignId)
    .then((topics) => {
      // Each campaign currently only has one topic, which is why this will work for now.
      // We may add a new field like isWebSignupTopic to determine which topic to save.
      // @see https://www.pivotaltracker.com/story/show/157981231
      const firstTopic = topics[0];
      if (!firstTopic) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.sendResponseWithStatusCode(res, 204, 'Campaign does not have any topics.');
      }
      helpers.request.setTopic(req, firstTopic);
      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
