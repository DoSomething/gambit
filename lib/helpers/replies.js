'use strict';

const Promise = require('bluebird');
const helpers = require('../helpers');
const logger = require('../logger');
const gambitCampaigns = require('../gambit-campaigns');
const Message = require('../../app/models/Message');

/**
 * Creates and sends outbound-reply Message with given messageText and messageTemplate.
 * @param {object} req
 * @param {object} res
 * @param {string} messageText
 * @param {string} messageTemplate
 */
function sendReply(req, res, messageText, messageTemplate) {
  logger.debug('sendReply', { messageText, messageTemplate }, req);
  let promise = Promise.resolve();

  // If this is a retry request, we should load the last outbound message if it exists
  if (req.isARetryRequest() && req.conversation.lastOutboundMessage) {
    promise = Message.updateMessageByRequestIdAndDirection(req.metadata.requestId,
      { metadata: req.metadata }, 'outbound-reply')
      .then(() => req.conversation.postLastOutboundMessageToPlatform());
  } else {
    promise = req.conversation.createAndPostOutboundReplyMessage(messageText, messageTemplate, req);
  }

  return promise
    .then(() => {
      const data = {
        // TODO: Include User, Signup, Conversation properties.
        messages: {
          inbound: [req.inboundMessage],
          outbound: [req.conversation.lastOutboundMessage],
        },
      };

      return res.send({ data });
    })
    .catch(err => helpers.sendErrorResponse(res, err));
}

/**
 * @param {string} string
 * @param {object} signup
 * @return {string}
 */
function replaceQuantity(string, signup) {
  let quantity = signup.totalQuantitySubmitted;
  const draft = signup.draftReportbackSubmission;
  if (draft) {
    quantity = draft.quantity;
  }

  if (quantity) {
    return string.replace(/{{quantity}}/gi, quantity);
  }
  return string;
}

/**
 * Sends given template for Conversation Campaign as reply.
 * @param {object} req
 * @param {object} res
 * @param {string} messageTemplate
 */
module.exports.sendReplyWithCampaignTemplate = function (req, res, messageTemplate) {
  const campaign = req.campaign;
  if (!campaign.id) {
    return helpers.sendErrorResponse(res, 'req.campaign undefined');
  }

  const template = campaign.templates[messageTemplate];
  if (!template) {
    return helpers.sendErrorResponse(res, `req.campaign.templates.${messageTemplate} undefined`);
  }
  let messageText = template.rendered;

  if (req.signup) {
    messageText = replaceQuantity(messageText, req.signup);
  }

  return sendReply(req, res, messageText, messageTemplate);
};

/**
 * Sends reply message by posting inboundMessage to Gambit Campaigns for Conversation Campaign.
 * @param {object} req
 * @param {object} res
 */
module.exports.continueCampaign = function (req, res) {
  const campaignId = req.campaign.id;
  if (!campaignId) {
    return helpers.sendErrorResponse(res, 'req.campaign undefined');
  }

  return gambitCampaigns.postReceiveMessage(req)
    .then((gambitCampaignsRes) => {
      req.signup = gambitCampaignsRes.signup;
      logger.debug('continueCampaign', { signupId: req.signup.id }, req);
      return exports.sendReplyWithCampaignTemplate(req, res, gambitCampaignsRes.replyTemplate);
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};

module.exports.askContinue = function (req, res) {
  return exports.sendReplyWithCampaignTemplate(req, res, 'askContinue');
};

module.exports.askSignup = function (req, res) {
  return exports.sendReplyWithCampaignTemplate(req, res, 'askSignup');
};

module.exports.campaignClosed = function (req, res) {
  return exports.sendReplyWithCampaignTemplate(req, res, 'campaignClosed');
};

module.exports.confirmedContinue = function (req, res) {
  // Set this to include the "Picking up where you left off" prefix in Gambit Campaigns reply.
  req.keyword = 'continue';

  return exports.continueCampaign(req, res);
};

module.exports.confirmedSignup = function (req, res) {
  // Set this to trigger Campaign Doing Menu reply in Gambit Campaigns.
  req.keyword = 'confirmed';

  return exports.continueCampaign(req, res);
};

module.exports.declinedContinue = function (req, res) {
  return exports.sendReplyWithCampaignTemplate(req, res, 'declinedContinue');
};

module.exports.declinedSignup = function (req, res) {
  return exports.sendReplyWithCampaignTemplate(req, res, 'declinedSignup');
};

module.exports.invalidAskContinueResponse = function (req, res) {
  return exports.sendReplyWithCampaignTemplate(req, res, 'invalidAskContinueResponse');
};

module.exports.invalidAskSignupResponse = function (req, res) {
  return exports.sendReplyWithCampaignTemplate(req, res, 'invalidAskSignupResponse');
};

module.exports.rivescriptReply = function (req, res, messageText) {
  return sendReply(req, res, messageText, 'rivescript');
};

/**
 * Send templates defined in Gambit Conversations.
 */
function sendGambitConversationsTemplate(req, res, template) {
  logger.debug('sendGambitConversationsTemplate', { template });
  const text = helpers.template.getTextForTemplate(template);
  return sendReply(req, res, text, template);
}

module.exports.badWords = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'badWords');
};

module.exports.crisisMessage = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'crisis');
};

module.exports.infoMessage = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'info');
};

module.exports.noCampaign = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'noCampaign');
};

module.exports.noReply = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'noReply');
};

module.exports.subscriptionStatusLess = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'subscriptionStatusLess');
};

module.exports.subscriptionStatusStop = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'subscriptionStatusStop');
};

module.exports.supportRequested = function (req, res) {
  if (req.campaign) {
    return exports.sendReplyWithCampaignTemplate(req, res, 'memberSupport');
  }
  return sendGambitConversationsTemplate(req, res, 'supportRequested');
};
