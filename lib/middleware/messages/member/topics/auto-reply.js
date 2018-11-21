'use strict';

const helpers = require('../../../../helpers');

module.exports = function catchAllAutoReply() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAutoReply(req.topic)) {
        return next();
      }
      // TODO: Confirm this post to campaignActivity isn't used anymore, this should have been
      // handled by inbound topic change. This is likely before the days of transition entries and
      // should be removed.
      if (helpers.request.hasCampaign(req)) {
        await helpers.request.postCampaignActivity(req);
      }

      return helpers.replies.autoReply(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
