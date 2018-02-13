'use strict';

const attachments = require('./attachments');

/**
 * Slack helper
 */
module.exports = {
  /**
   * parseBody - parses properties out of the body of a Gambit Slack request
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    req.platform = 'slack';
    req.platformUserId = req.body.email;
    req.platformMessageId = req.body.messageId;

    const attachmentObject = attachments.parseFromReq(req);

    if (attachmentObject.url) {
      req.mediaUrl = attachmentObject.url;
      attachments.add(req, attachmentObject, 'inbound');
    }
  },
};
