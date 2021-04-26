'use strict';

const helpers = require('../helpers');
const logger = require('../logger');
const config = require('../../config/lib/helpers/replies');

/**
 * @return {Object}
 */
module.exports.templates = {
  campaignClosed: () => config.campaignClosed,
  // TODO: Macro replies will eventually get moved into this replies helper config.
  subscriptionStatusActive: () =>
    helpers.macro.getMacro('subscriptionStatusActive'),
};

/**
 * Creates and sends outbound-reply Message with given messageText and messageTemplate.
 * @param {object} req
 * @param {object} res
 * @param {string} messageText
 * @param {string} messageTemplate
 */
module.exports.sendReply = async function (
  req,
  res,
  messageText,
  messageTemplate
) {
  // TODO: Move to config
  const direction = 'outbound-reply';
  logger.debug('sendReply', { messageTemplate }, req);

  try {
    const user = await helpers.user.updateByMemberMessageReq(req);
    // set updated user
    helpers.request.setUser(req, user);
    /**
     * If it is a retry request, but no outbound was created as part of the retry, we need to
     * create and set the lastOutboundMessage as well.
     */
    if (helpers.request.shouldCreateLastOutboundMessage(req)) {
      await req.conversation.createAndSetLastOutboundMessage(
        direction,
        messageText,
        messageTemplate,
        req
      );
    }
    // Checks the headers and the req.suppressOutbound property. If the request has not been
    // marked for suppressing, post to Twilio
    if (!helpers.request.shouldSuppressOutboundReply(req)) {
      await req.conversation.postLastOutboundMessageToPlatform(req);
    }

    const messages = {
      inbound: [req.inboundMessage],
      outbound: [req.conversation.lastOutboundMessage],
    };

    return helpers.response.sendData(res, { messages });
  } catch (err) {
    /**
     * This catches a user update error or post to platform error.
     * I think we should expose this error metadata in NewRelic.
     */
    return helpers.errorNoticeable.sendErrorResponse(res, err);
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
module.exports.sendReplyWithTopicTemplate = function (
  req,
  res,
  messageTemplate
) {
  let messageText;
  try {
    messageText = helpers.topic.getTopicTemplateText(
      req.topic,
      messageTemplate
    );
    if (req.signup) {
      messageText = replaceQuantity(messageText, req.signup);
    }
  } catch (err) {
    return helpers.sendErrorResponse(res, err);
  }
  return exports.sendReply(req, res, messageText, messageTemplate);
};

module.exports.autoReply = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'autoReply');
};

module.exports.askPhoto = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'askPhoto');
};

module.exports.askQuantity = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'askQuantity');
};

module.exports.askWhyParticipated = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'askWhyParticipated');
};

module.exports.completedPhotoPost = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'completedPhotoPost');
};

module.exports.completedTextPost = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'completedTextPost');
};

module.exports.invalidAskYesNoResponse = function (req, res) {
  return exports.sendReplyWithTopicTemplate(
    req,
    res,
    'invalidAskYesNoResponse'
  );
};

module.exports.invalidPhoto = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'invalidPhoto');
};

module.exports.invalidQuantity = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'invalidQuantity');
};

module.exports.invalidText = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'invalidText');
};

module.exports.invalidWhyParticipated = function (req, res) {
  return exports.sendReplyWithTopicTemplate(req, res, 'invalidWhyParticipated');
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

module.exports.startPhotoPostAutoReply = function (req, res) {
  return exports.sendReplyWithTopicTemplate(
    req,
    res,
    'startPhotoPostAutoReply'
  );
};

module.exports.sendReplyWithStaticTemplate = function (req, res, templateName) {
  const { text } = config[templateName];

  return exports.sendReply(req, res, text, templateName);
};

module.exports.askHoursSpent = function (req, res) {
  return exports.sendReplyWithStaticTemplate(req, res, 'askHoursSpent');
};

module.exports.badWords = function (req, res) {
  return exports.sendReplyWithStaticTemplate(req, res, 'badWords');
};

module.exports.campaignClosed = function (req, res) {
  return exports.sendReplyWithStaticTemplate(req, res, 'campaignClosed');
};

module.exports.invalidHoursSpent = function (req, res) {
  return exports.sendReplyWithStaticTemplate(req, res, 'invalidHoursSpent');
};

module.exports.noCampaign = function (req, res) {
  return exports.sendReplyWithStaticTemplate(req, res, 'noCampaign');
};

module.exports.noReply = function (req, res) {
  return exports.sendReplyWithStaticTemplate(req, res, 'noReply');
};
