'use strict';

const logger = require('../../lib/logger');
const config = require('../../config/lib/helpers/template');
const macroConfig = require('../../config/lib/helpers/macro');
/**
 * @return {Object}
 */
function getSubscriptionStatusActive() {
  return macroConfig.macros.subscriptionStatusActive;
}

/**
 * @param {String} templateName
 * @return {Boolean}
 */
function isTopicTemplate(templateName) {
  const result = config.topicTemplates.includes(templateName);
  logger.debug('isTopicTemplate', { templateName, result });
  return result;
}

module.exports = {
  getSubscriptionStatusActive,
  getTextForTemplate: function getTextForTemplate(templateName) {
    return config.conversationsTemplatesText[templateName];
  },
  isAskContinueTemplate: function isAskContinueTemplate(templateName) {
    return config.askContinueTemplates.includes(templateName);
  },
  isTopicTemplate,
};
