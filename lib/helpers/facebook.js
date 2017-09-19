'use strict';

/**
 * Facebook helper
 */
module.exports = {
  /**
   * parseBody - parses properties out of the body of a Facebook request
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    req.platform = 'facebook';
    req.platformUserId = req.body.facebookId;
    req.platformMessageId = req.body.messageId;

    // TODO: Should we support attachments for facebook?
  },
};
