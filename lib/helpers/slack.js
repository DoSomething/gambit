'use strict';

/**
 * Slack helper
 */
module.exports = {
  /**
   * parseBody - parses properties out of the body of a Slack request
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    req.platform = 'slack';
    req.platformUserId = req.body.slackId;
    req.slackChannel = req.body.slackChannel;
    req.platformMessageId = req.body.messageId;
    req.mediaUrl = req.body.mediaUrl;
  },
};
