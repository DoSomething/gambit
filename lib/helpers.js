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

/**
 * Sends Express response for incoming POST Chatbot Express request.
 *
 * @param {object} req
 * @param {object} res
 */
module.exports.sendChatbotResponse = function (req, res) {
  res.send({
    request: {
      message: req.body.message,
    },
    response: {
      message: req.renderedReplyMessage,
      user: req.user,
    },
  });
};

/**
 * Sends given error message as Express response to an incoming Chatbot POST Express request.
 *
 * @param {object} req
 * @param {object} res
 */
module.exports.sendChatbotResponseForError = function (req, res, error) {
  res.send({
    request: {
      message: req.body.message,
    },
    response: {
      message: error.message,
      user: req.user,
    },
  });
};
