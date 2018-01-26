'use strict';

const logger = require('../../lib/logger');
const config = require('../../config/lib/helpers/template');

module.exports = {
  getTextForTemplate: function getTextForTemplate(templateName) {
    return config.conversationsTemplatesText[templateName];
  },
  isAskContinueTemplate: function isAskContinueTemplate(templateName) {
    return config.askContinueTemplates.includes(templateName);
  },
  isAskSignupTemplate: function isAskSignupTemplate(templateName) {
    return config.askSignupTemplates.includes(templateName);
  },
  isGambitCampaignsTemplate: function isGambitCampaignsTemplate(templateName) {
    const result = config.gambitCampaignsTemplates.includes(templateName);
    logger.debug('isGambitCampaignsTemplate', { templateName, result });

    return result;
  },
};
