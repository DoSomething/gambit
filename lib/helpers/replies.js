'use strict';

const helpers = require('../helpers');
const logger = require('../logger');

/**
 * Creates and sends outbound-reply Message with given messageText and messageTemplate.
 * @param {object} req
 * @param {object} res
 * @param {string} messageText
 * @param {string} messageTemplate
 */
module.exports.sendReply = async function (req, res, messageText, messageTemplate) {
  logger.debug('sendReply', { messageTemplate }, req);

  try {
    req.user = await helpers.user.updateByMemberMessageReq(req);
    logger.debug('updated user', { id: req.user.id }, req);

    const direction = 'outbound-reply';
    const notARetry = !req.isARetryRequest();
    const retryWithoutLoadedOutboundMessage = (req.isARetryRequest() && !req.outboundMessage);

    /**
     * If it's not a retry request, we have to create and set the lastOutboundMessage.
     * If it is a retry request, but no outbound was created as part of the retry, we need to
     * create and set the lastOutboundMessage as well.
     */
    if (notARetry || retryWithoutLoadedOutboundMessage) {
      await req.conversation
        .createAndSetLastOutboundMessage(direction, messageText, messageTemplate, req);
    }

    if (helpers.request.shouldSuppressOutboundReply(req)) {
      logger.debug('suppressing reply', {}, req);
    } else {
      await req.conversation.postLastOutboundMessageToPlatform(req);
    }

    const messages = {
      inbound: [req.inboundMessage],
      outbound: [req.conversation.lastOutboundMessage],
    };

    return helpers.response.sendData(res, { messages });
  } catch (err) {
    return helpers.sendErrorResponse(res, err);
  }
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
 * Sends given template for req.topic as reply.
 * @param {object} req
 * @param {object} res
 * @param {string} messageTemplate
 */
module.exports.sendReplyWithTopicTemplate = function (req, res, messageTemplate) {
  let messageText;
  try {
    messageText = helpers.topic.getTopicTemplateText(req.topic, messageTemplate);
    if (req.signup) {
      messageText = replaceQuantity(messageText, req.signup);
    }
  } catch (err) {
    return helpers.sendErrorResponse(res, err);
  }
  return exports.sendReply(req, res, messageText, messageTemplate);
};

/**
 * Sends reply message by posting inboundMessage to Gambit Campaigns for Conversation Campaign.
 * @param {object} req
 * @param {object} res
 */
module.exports.continueTopic = function (req, res) {
  if (!req.campaign) {
    return module.exports.noCampaign(req, res);
  }

  if (helpers.request.isClosedCampaign(req)) {
    return module.exports.campaignClosed(req, res);
  }

  return helpers.request.postCampaignActivity(req)
    .then((gambitCampaignsRes) => {
      logger.debug('postCampaignActivity success', gambitCampaignsRes, req);
      return exports.sendReplyWithTopicTemplate(req, res, gambitCampaignsRes.replyTemplate);
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};

module.exports.askContinue = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'askContinue');
};

module.exports.autoReply = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'autoReply');
};

module.exports.campaignClosed = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'campaignClosed');
};

module.exports.confirmedContinue = function (req, res) {
  // TODO: Use this to include the "Picking up where you left off" prefix in the reply message.
  req.keyword = 'continue';

  return exports.continueTopic(req, res);
};

module.exports.declinedContinue = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'declinedContinue');
};

module.exports.invalidAskContinueResponse = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'invalidAskContinueResponse');
};

module.exports.invalidAskYesNoResponse = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'invalidAskYesNoResponse');
};

module.exports.rivescriptReply = function (req, res, messageText) {
  return exports.sendReply(req, res, messageText, 'rivescript');
};

module.exports.saidNo = function (req, res, messageText) {
  return exports.sendReply(req, res, messageText, 'saidNo');
};

module.exports.saidYes = function (req, res, messageText) {
  return exports.sendReply(req, res, messageText, 'saidYes');
};

// TODO: Rename and refactor this. Deprecate the template lib and define the message text for these
// non-macro non-topic static messages to live in a new replies config.
module.exports.sendGambitConversationsTemplate = function (req, res, template) {
  logger.debug('sendGambitConversationsTemplate', { template });
  const text = helpers.template.getTextForTemplate(template);
  return exports.sendReply(req, res, text, template);
};

module.exports.badWords = function (req, res) {
  return exports.sendGambitConversationsTemplate(req, res, 'badWords');
};

module.exports.noCampaign = function (req, res) {
  return exports.sendGambitConversationsTemplate(req, res, 'noCampaign');
};

module.exports.noReply = function (req, res) {
  return exports.sendReply(req, res, '', 'noReply');
};
