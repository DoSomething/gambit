'use strict';

// TODO: Change file name
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');
const helpers = require('../../../helpers');

module.exports = function parseTopic() {
  return (req, res, next) => {
    try {
      if (helpers.request.isClosedCampaign(req)) {
        return helpers.sendErrorResponse(res, new UnprocessibleEntityError('Campaign is closed.'));
      }
      const template = helpers.campaign.getWebSignupMessageTemplateNameFromCampaign(req.campaign);
      helpers.request.setOutboundMessageTemplate(req, template);
      const text = helpers.topic.getRenderedTextFromTopicAndTemplateName(req.topic, template);
      helpers.request.setOutboundMessageText(req, text);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }

    return next();
  };
};
