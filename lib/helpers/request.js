'use strict';

/**
 * Request helper
 */
module.exports = {
  isTwilio: function isTwilio(req) {
    return !!req.body.MessageSid;
  },
  isSlack: function isSlack(req) {
    return !!req.body.slackId;
  },
  isFacebook: function isFacebook(req) {
    return !!req.body.facebookId;
  },
  isFront: function isFront(req) {
    // TODO: Should be in a config constant
    return !!req.get('x-front-signature');
  },
  isCustomerIo: function isCustomerIo(req) {
    const platform = req.query.platform || req.body.platform;
    // TODO: Should be in a config constant
    return platform === 'customerio';
  },
};
