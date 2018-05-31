'use strict';

const Promise = require('bluebird');
const helpers = require('../helpers');
const logger = require('../logger');
const gambitCampaigns = require('../gambit-campaigns');

/**
 * Creates and sends outbound-reply Message with given messageText and messageTemplate.
 * @param {object} req
 * @param {object} res
 * @param {string} messageText
 * @param {string} messageTemplate
 */
module.exports.sendReply = function (req, res, messageText, messageTemplate) {
  logger.debug('sendReply', { messageTemplate }, req);
  const direction = 'outbound-reply';
  const notARetry = !req.isARetryRequest();
  const retryWithoutLoadedOutboundMessage = (req.isARetryRequest() && !req.outboundMessage);

  let promise = Promise.resolve(true);
  /**
   * If it's not a retry request, we have to create and set the lastOutboundMessage. Also, if it
   * is a retry request, but no outbound was created as part of the retry, we need to create and set
   * the lastOutboundMessage as well.
   */
  if (notARetry || retryWithoutLoadedOutboundMessage) {
    promise = req.conversation
      .createAndSetLastOutboundMessage(direction, messageText, messageTemplate, req);
  }
  return promise
    .then(() => {
      if (helpers.request.shouldSuppressOutboundReply(req)) {
        logger.debug('suppressing reply', {}, req);
        return Promise.resolve(true);
      }
      return req.conversation.postLastOutboundMessageToPlatform(req);
    })
    .then(() => {
      const data = {
        messages: {
          inbound: [req.inboundMessage],
          outbound: [req.conversation.lastOutboundMessage],
        },
      };

      return res.send({ data });
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};

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
  let messageText;
  try {
    if (req.topic) {
      messageText = helpers.topic
        .getRenderedTextFromTopicAndTemplateName(req.topic, messageTemplate);
    } else {
      messageText = gambitCampaigns
        .getMessageTextFromMessageTemplate(req.campaign, messageTemplate);
    }
  } catch (err) {
    return helpers.sendErrorResponse(res, err);
  }

  if (req.signup) {
    messageText = replaceQuantity(messageText, req.signup);
  }

  return exports.sendReply(req, res, messageText, messageTemplate);
};

/**
 * Sends reply message by posting inboundMessage to Gambit Campaigns for Conversation Campaign.
 * @param {object} req
 * @param {object} res
 */
module.exports.continueCampaign = function (req, res) {
  logger.debug('continueCampaign');
  const campaignId = req.campaignId;
  if (!campaignId) {
    return helpers.sendErrorResponse(res, 'req.campaign undefined');
  }

  return gambitCampaigns.postCampaignActivity(req)
    .then((gambitCampaignsRes) => {
      logger.debug('postCampaignActivity success', gambitCampaignsRes);
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
  return exports.sendReply(req, res, messageText, 'rivescript');
};

/**
 * Send templates defined in Gambit Conversations.
 */
module.exports.sendGambitConversationsTemplate = function (req, res, template) {
  logger.debug('sendGambitConversationsTemplate', { template });
  const text = helpers.template.getTextForTemplate(template);
  return exports.sendReply(req, res, text, template);
};

module.exports.badWords = function (req, res) {
  return exports.sendGambitConversationsTemplate(req, res, 'badWords');
};

module.exports.crisisMessage = function (req, res) {
  return exports.sendGambitConversationsTemplate(req, res, 'crisis');
};

module.exports.infoMessage = function (req, res) {
  return exports.sendGambitConversationsTemplate(req, res, 'info');
};

module.exports.noCampaign = function (req, res) {
  return exports.sendGambitConversationsTemplate(req, res, 'noCampaign');
};

module.exports.noReply = function (req, res) {
  return exports.sendGambitConversationsTemplate(req, res, 'noReply');
};

module.exports.subscriptionStatusLess = function (req, res) {
  return exports.sendGambitConversationsTemplate(req, res, 'subscriptionStatusLess');
};

module.exports.subscriptionStatusStop = function (req, res) {
  return exports.sendGambitConversationsTemplate(req, res, 'subscriptionStatusStop');
};

module.exports.supportRequested = function (req, res) {
  if (req.campaign) {
    return exports.sendReplyWithCampaignTemplate(req, res, 'memberSupport');
  }
  return exports.sendGambitConversationsTemplate(req, res, 'supportRequested');
};
