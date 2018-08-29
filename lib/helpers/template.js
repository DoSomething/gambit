'use strict';

const logger = require('../../lib/logger');
const config = require('../../config/lib/helpers/template');

/**
 * @return {Object}
 */
function getSubscriptionStatusActive() {
  return config.templatesMap.gambitConversationsTemplates.subscriptionStatusActive;
}

module.exports = {
  getSubscriptionStatusActive,
  getTextForTemplate: function getTextForTemplate(templateName) {
    return config.conversationsTemplatesText[templateName];
  },
  isAskContinueTemplate: function isAskContinueTemplate(templateName) {
    return config.askContinueTemplates.includes(templateName);
  },
  isGambitCampaignsTemplate: function isGambitCampaignsTemplate(templateName) {
    const result = config.gambitCampaignsTemplates.includes(templateName);
    logger.debug('isGambitCampaignsTemplate', { templateName, result });

    return result;
  },
};
