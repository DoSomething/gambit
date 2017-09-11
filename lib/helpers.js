'use strict';

const logger = require('heroku-logger');
const Promise = require('bluebird');
const request = require('request-promise');

const contentful = require('./contentful');
const gambitCampaigns = require('./gambit-campaigns');

const config = require('../config/lib/helpers');

/**
 * Attachments helper
 * // TODO: Should this live inside the exports.request object namespace?
 */
module.exports.attachments = {

  /**
   * add - Adds attachments to its respective direction array.
   *
   * @param  {object} req
   * @param  {object} attachmentObject object containing url, and contentType
   * @param  {string} direction = 'inbound' direction array where to store this attachment
   */
  add: function add(req, attachmentObject, direction = 'inbound') {
    if (attachmentObject.url) {
      // TODO: req.attachments might not exist if this function is called from a route
      // that doesnt set a default req.attachments
      req.attachments[direction].push({
        url: attachmentObject.url,
        contentType: attachmentObject.contentType,
      });
    }
  },

  /**
   * parseFromReq - creates a generic attachment object from a req which contains a mediaUrl in the
   * body of the request.
   *
   * @param  {type} req description
   * @return {type}     description
   */
  parseFromReq: function parseFromReq(req) {
    return {
      url: req.body.mediaUrl,
    };
  },
};

/**
 * Slack helper
 */
module.exports.slack = {
  /**
   * parseBody - parses properties out of the body of a Slack request
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    req.platform = 'slack';
    req.platformUserId = req.body.slackId;
    req.slackChannel = req.body.slackChannel;
    req.platformMessageId = req.body.messageId;
    req.mediaUrl = req.body.mediaUrl;
  },
};

/**
 * Facebook helper
 */
module.exports.facebook = {
  /**
   * parseBody - parses properties out of the body of a Facebook request
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    req.platform = 'facebook';
    req.platformUserId = req.body.facebookId;
    req.platformMessageId = req.body.messageId;
  },
};


/**
 * Twilio helper
 */
module.exports.twilio = {

  /**
   * parseBody - parses properties out of the body of a Twilio request
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    req.platform = 'sms';
    req.platformUserId = req.body.From;
    req.inboundMessageText = req.body.Body;
    req.platformMessageId = req.body.MessageSid;

    const attachmentObject = this.parseAttachmentFromReq(req);

    return new Promise((resolve, reject) => {
      if (attachmentObject.redirectUrl) {
        exports.twilio.getAttachmentUrl(attachmentObject.redirectUrl)
          .then((url) => {
            req.mediaUrl = url;
            attachmentObject.url = url;
            exports.attachments.add(req, attachmentObject, 'inbound');
            resolve(url);
          })
          .catch(error => reject(error));
      } else {
        resolve('attachmentObject does\'t contain a redirectUrl');
      }
    });
  },

  /**
   * parseAttachmentFromReq - parses the MediaUrl0 and MediaContentType0 out of Twilio requests
   * and creates an attachent object
   *
   * @param  {object} req
   * @return {object}
   */
  parseAttachmentFromReq: function parseAttachmentFromReq(req) {
    return {
      redirectUrl: req.body.MediaUrl0,
      contentType: req.body.MediaContentType0,
    };
  },

  /**
   * getAttachmentUrl - It makes a GET request to the redirectUrl uri. It redirects the request
   * and returns the actual attachment's data. We are interested in storing the actual attachment's
   * address, which we get from the full response object of the request.
   *
   * @param  {string} redirectUrl
   * @return {promise}
   */
  getAttachmentUrl: function getAttachmentUrl(redirectUrl) {
    const options = {
      uri: redirectUrl,
      // needed, otherwise returns the parsed body
      resolveWithFullResponse: true,
    };

    return request(options)
      .then((redirectRes) => {
        let url = '';
        try {
          url = redirectRes.request.uri.href;
        } catch (error) {
          // The data structure might have changed and code needs to be updated.
          logger.error('The Twilio attachment redirectUrl returns an error', error);
        }
        return url;
      });
  },
};


/**
 * Request helper
 */
module.exports.request = {
  isTwilio: function isTwilio(req) {
    return !!req.body.MessageSid;
  },
  isSlack: function isSlack(req) {
    return !!req.body.slackId;
  },
  isFacebook: function isFacebook(req) {
    return !!req.body.facebookId;
  },
  isFront: function isFront(req) {
    // TODO: Should be in a config constant
    return !!req.get('x-front-signature');
  },
  isCustomerIO: function isCustomerIO(req) {
    const platform = req.query.platform || req.body.platform;
    // TODO: Should be in a config constant
    return platform === 'customerio';
  },
};

module.exports.isAskContinueTemplate = function (templateName) {
  return config.askContinueTemplates.includes(templateName);
};

module.exports.isAskSignupTemplate = function (templateName) {
  return config.askSignupTemplates.includes(templateName);
};

module.exports.isConfirmedCampaignMacro = function (text) {
  return (text === config.macros.confirmedCampaign);
};

module.exports.isDeclinedCampaignMacro = function (text) {
  return (text === config.macros.declinedCampaign);
};

module.exports.isGambitCampaignsTemplate = function (templateName) {
  const result = config.gambitCampaignsTemplates.includes(templateName);
  logger.trace('isGambitCampaignsTemplate', { templateName, result });

  return result;
};

module.exports.isMacro = function (text) {
  const result = config.macros[text];
  logger.trace('isMacro', { text, result });

  return result;
};

module.exports.isMenuCommand = function (text = '') {
  return (text.toLowerCase() === config.menuCommand);
};

/**
 * Sends response with err code and message.
 *
 * @param  {Object} res
 * @param  {Error} err
 */
module.exports.sendErrorResponse = function (res, err) {
  let status = err.status;
  if (!status) {
    status = 500;
  }
  let message = err.message;
  if (!message) {
    message = err;
  }
  return this.sendResponseWithStatusCode(res, status, message);
};

/**
 * Sends response with custom status code and message
 *
 * @param  {Object} res
 * @param  {Number} code = 200
 * @param  {String} message = 'OK'
 */
module.exports.sendResponseWithStatusCode = function (res, code = 200, message = 'OK') {
  const response = { message };
  logger.debug('sendResponseWithStatusCode', { code, response });

  return res.status(code).send(response);
};

/**
 * Sends response with Message.
 * @param {object} req
 * @param {Message} message
 */
module.exports.sendResponseWithMessage = function (res, message) {
  logger.debug('sendResponseWithMessage', { messageId: message.id });

  const data = { messages: [message] };

  return res.send({ data });
};

/**
 * Creates and sends outbound-reply Message with given messageText and messageTemplate.
 * @param {object} req
 * @param {object} res
 * @param {string} messageText
 * @param {string} messageTemplate
 */
function sendReply(req, res, messageText, messageTemplate) {
  logger.debug('sendReply', { messageText, messageTemplate });
  return req.conversation.createAndPostOutboundReplyMessage(messageText, messageTemplate, req)
    .then(() => {
      const data = {
        inbound: [req.inboundMessage],
        outbound: [req.conversation.lastOutboundMessage],
      };

      return res.send({ data });
    })
    .catch(err => exports.sendErrorResponse(res, err));
}

/**
 * Sends given template for Conversation Campaign as reply.
 * @param {object} req
 * @param {object} res
 * @param {string} messageTemplate
 */
function sendReplyWithCampaignTemplate(req, res, messageTemplate) {
  const campaign = req.campaign;
  if (!campaign._id) {
    return exports.sendErrorResponse(res, 'req.campaign undefined');
  }

  const messageText = campaign.templates[messageTemplate];
  if (!messageText) {
    return exports.sendErrorResponse(res, `req.campaign.templates.${messageTemplate} undefined`);
  }

  return sendReply(req, res, messageText, messageTemplate);
}

/**
 * Sends reply message by posting inboundMessage to Gambit Campaigns for Conversation Campaign.
 * @param {object} req
 * @param {object} res
 */
module.exports.continueCampaign = function (req, res) {
  const campaignId = req.campaign._id;
  if (!campaignId) {
    return exports.sendErrorResponse(res, 'req.campaign undefined');
  }

  return gambitCampaigns.postReceiveMessage(req)
    .then(reply => sendReply(req, res, reply.message, reply.template))
    .catch(err => exports.sendErrorResponse(res, err));
};

module.exports.askContinue = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'askContinue');
};

module.exports.askSignup = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'askSignup');
};

module.exports.campaignClosed = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'campaignClosed');
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
  return sendReplyWithCampaignTemplate(req, res, 'declinedContinue');
};

module.exports.declinedSignup = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'declinedSignup');
};

module.exports.invalidAskContinueResponse = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'invalidAskContinueResponse');
};

module.exports.invalidAskSignupResponse = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'invalidAskSignupResponse');
};

module.exports.noCampaign = function (req, res) {
  // Move to config.
  const text = 'Sorry, I\'m not sure how to respond to that.\n\nSay MENU to find a Campaign to join.';
  const template = 'noCampaignMessage';

  return sendReply(req, res, text, template);
};

module.exports.noReply = function (req, res) {
  return sendReply(req, res, '', 'noReply');
};

module.exports.rivescriptReply = function (req, res, messageText) {
  return sendReply(req, res, messageText, 'rivescript');
};

/**
 * gets contentful broadcast object
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {Promise}
 */
module.exports.getBroadcast = function getBroadcast(req, res) {
  return contentful.fetchBroadcast(req.broadcastId)
    .then((broadcast) => {
      if (!broadcast) {
        return exports.sendResponseWithStatusCode(res, 404, `Broadcast ${req.broadcast_id} not found.`);
      }

      return broadcast;
    })
    .catch(err => exports.sendErrorResponse(res, err));
};
