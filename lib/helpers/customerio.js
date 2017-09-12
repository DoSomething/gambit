'use strict';

/**
 * Customer.io helper
 */
module.exports = {
  /**
   * parseBody - parses properties out of the body of a Facebook request
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    req.platform = 'sms';
    req.platformUserId = req.body.phone;
    req.broadcastId = req.body.broadcastId;
    req.messageFields = req.body.fields;
  },
};
