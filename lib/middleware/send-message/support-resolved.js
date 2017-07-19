'use strict';

const logger = require('heroku-logger');
const front = require('../../front');

module.exports = function resolveSupportRequest() {
  return (req, res, next) => {
    front.get(req.frontConversationUrl)
      .then((frontConversation) => {
        // If the Front agent has archived this conversation, our Support Request has been resolved.
        if (frontConversation.status === 'archived') {
          logger.debug('support request resolved');
          return req.user.supportResolved().then(() => next());
        }

        return next();
      })
      .catch(err => err);
  };
};
