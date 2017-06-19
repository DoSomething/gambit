'use strict';

const Users = require('../app/models/User');
const Campaigns = require('../app/models/Campaign');

module.exports.getInvalidMichaelMessage = function () {
  return 'Sorry, the only Michaels I know are Jackson and Bolton. Say cancel if you want to talk about something else';
};

module.exports.postSignup = function (user, campaign) {
  return user.postSignupForCampaign(campaign).then(() => campaign.gambitSignupMenuMessage);
}

module.exports.promptSignup = function (user, campaign) {
  return user.promptSignupForCampaign(campaign).then(() => campaign.getSignupPromptMessage());
}
