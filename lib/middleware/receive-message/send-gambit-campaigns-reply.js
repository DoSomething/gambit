'use strict';

const helpers = require('../../helpers');

module.exports = function campaignSignupMessage() {
  return (req, res) => helpers.sendReplyForCampaignSignupMessage(req, res);
};
