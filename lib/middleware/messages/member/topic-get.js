'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function fetchCurrentTopic() {
  return (req, res, next) => {
    // If we've made it this far - we're headed into the catchAll macro, our inbound message hasn't
    // found a reply to send yet. Fetch the topic to load its replies.
    const topicId = req.currentTopicId;
    let promise;
    // If we're in the default topic, there's nothing to talk about! We'll mock our fetch request as
    // a 404 to try fetching for a new topic by the last saved campaignId.
    if (helpers.topic.isDefaultTopicId(topicId)) {
      promise = Promise.reject({ status: 404 });
    // TODO: Not expecting that we'd be in this middleware if our topic hs hardcoded, but we're
    // seeing 404 requests for GET /topics/:id for ask_subscription_status. This may occur in known
    // instances where sending an image or an emoji seems to break users out of a Rivescript topic
    // and into the random topic.
    // @see https://www.pivotaltracker.com/story/show/158439950
    } else {
      promise = helpers.topic.fetchById(topicId);
    }

    return promise
      .then((topic) => {
        logger.debug('found topic', { topicId });
        helpers.request.setTopic(req, topic);
        return next();
      })
      .catch((error) => {
        if (error.status !== 404) {
          return helpers.sendErrorResponse(res, error);
        }
        const campaignId = req.conversation.campaignId;
        logger.debug('Topic not found, checking by campaign', { topicId, campaignId }, req);
        if (!campaignId) {
          return helpers.replies.noCampaign(req, res);
        }
        return helpers.topic.fetchByCampaignId(campaignId)
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
            // Save the topic so we won't have to fetch by campaignId upon next request.
            return helpers.request.changeTopic(req, firstTopic).then(() => next());
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

