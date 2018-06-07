'use strict';

const helpers = require('../../../helpers');

module.exports = function getCurrentTopic() {
  return (req, res, next) => {
    const currentTopicId = req.conversation.topic;
    return helpers.topic.fetchById(currentTopicId)
      .then((topic) => {
        helpers.request.setTopic(req, topic);
        return next();
      })
      .catch((error) => {
        if (error.status !== 404) {
          return helpers.sendErrorResponse(res, error);
        }

        const campaignId = req.conversation.campaignId;
        if (!campaignId) {
          return helpers.replies.noCampaign(req, res);
        }

        return helpers.topic.fetchByCampaignId(req.conversation.campaignId)
          .then((topics) => {
            if (!topics.length) {
              return helpers.replies.noCampaign(req, res);
            }
            // Each campaign currently only has one topic, which is why this will work for now.
            // Ideally all topics should be findable via topics API this may be deprecated.
            const topic = topics[0];
            helpers.request.setTopic(req, topic);
            // Update the topic so we won't have to fetch by campaign upon next request.
            return req.conversation.changeTopic(topic).then(() => next());
          })
          .catch((err) => {
            // Sanity check for edge-case where campaign may not exist anymore.
            if (err.status === 404) {
              return helpers.replies.noCampaign(req, res);
            }
            return helpers.sendErrorResponse(res, err);
          });
      });
  };
};

