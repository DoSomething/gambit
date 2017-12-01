'use strict';

const logger = require('../../lib/logger');
const config = require('../../config/lib/helpers/templates');

module.exports = {
  getTextForTemplate: function getTextForTemplate(template) {
    return config.templateText[template];
  },
  isGambitCampaignsTemplate: function isGambitCampaignsTemplate(templateName) {
    const result = config.gambitCampaignsTemplates.includes(templateName);
    logger.debug('isGambitCampaignsTemplate', { templateName, result });

    return result;
  },
};
