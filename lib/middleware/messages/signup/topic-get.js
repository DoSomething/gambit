'use strict';

const helpers = require('../../../helpers');

module.exports = function getTopicByCampaignId() {
  return (req, res, next) => helpers.topic.fetchByCampaignId(req.campaignId)
    .then((topics) => {
      if (!topics) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.sendResponseWithStatusCode(res, 204, 'Campaign does not have any topics.');
      }
      // Each campaign currently only has one topic, which is why this will work for now.
      // We may need to find the topic that has a isWebSignupTopic propery set.
      // @see https://www.pivotaltracker.com/story/show/157981231
      helpers.request.setTopic(req, topics[0]);
      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
