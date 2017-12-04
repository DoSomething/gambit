'use strict';

const config = require('../../config/lib/helpers/templates');

module.exports = {
  getTextForTemplate: function getTextForTemplate(template) {
    return config.templateText[template];
  },
};
