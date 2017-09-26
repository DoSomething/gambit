'use strict';

function getBroadcastId(req) {
  return req.body.broadcastId || req.query.broadcastId;
}

/**
 * Broadcast helper
 */
module.exports = {
  /**
   * parseBody - parses properties out of the body of a Facebook request
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    req.broadcastId = getBroadcastId(req);
  },
};
