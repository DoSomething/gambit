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
            // Each campaign currently only has one topic, which is why this will work for now.
            // If a campaign had multiple topics and we're switching to a Content API topic from a
            // hardcoded topic here, we may want to track the lastCampaignTopicId a user was in to
            // ensure we ask continue for last specific campaign topic they participated in.
            const firstTopic = topics[0];
            if (!firstTopic) {
              // Technically this should be a closed campaign message, because user's in a campaign
              // that exists but no longer has topics. We'd need to make a separate request to find
              // the campaign title, or create a new hardcoded generic topicUnavailable template.
              return helpers.replies.noCampaign(req, res);
            }

            helpers.request.setTopic(req, firstTopic);
            // Save the topic so we won't have to fetch by campaignId upon next request.
            return req.conversation.changeTopic(firstTopic).then(() => next());
          })
          .catch((err) => {
            // Safety check for edge-case where conversation.campaignId no longer exists.
            if (err.status === 404) {
              return helpers.replies.noCampaign(req, res);
            }
            return helpers.sendErrorResponse(res, err);
          });
      });
  };
};

