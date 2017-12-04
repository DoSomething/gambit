'use strict';

const helpers = require('../../helpers');

module.exports = function sendNoCampaignMessage() {
  return (req, res, next) => {
    if (req.campaign) {
      return next();
    }

    return helpers.replies.noCampaign(req, res);
  };
};
