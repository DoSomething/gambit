'use strict';

module.exports.getInvalidMichaelMessage = function () {
  return 'Sorry, the only Michaels I know are Jackson and Bolton. Say cancel if you want to talk about something else';
};

module.exports.getSignupConfirmedMessage = function (campaign) {
  return `You're signed up for ${campaign.title}. #blessed`;
};

module.exports.getSignupDeclinedMessage = function () {
  return 'Ok, I\'ll check in with you later';
};

module.exports.getSignupPromptMessage = function (campaign) {
  return `Want to sign up for ${campaign.title}? Yes or No`;
};
