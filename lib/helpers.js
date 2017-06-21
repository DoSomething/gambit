'use strict';

module.exports.getInvalidMichaelMessage = function () {
  return 'Sorry, the only Michaels I know are Jackson and Bolton. Say cancel if you want to talk about something else';
};

module.exports.postSignup = function (user, campaign) {
  return user.postSignupForCampaign(campaign).then(() => campaign.gambitSignupMenuMessage);
};

module.exports.promptSignup = function (user, campaign) {
  return user.promptSignupForCampaign(campaign).then(() => campaign.getSignupPromptMessage());
};

module.exports.declineSignup = function (user, campaign) {
  return user.declineSignup().then(() => campaign.getSignupDeclinedMessage());
};
