'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');

module.exports = function rivescriptTemplate() {
  return (req, res, next) => {
    logger.debug('rivescriptTemplate', { rivescriptReplyText: req.rivescriptReplyText });

    if (!helpers.isMacro(req.rivescriptReplyText)) {
      return helpers.sendReply(req, res, req.rivescriptReplyText, 'brain');
    }

    return next();
  };
};
