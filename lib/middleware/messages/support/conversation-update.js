'use strict';

const logger = require('../../../logger');
const front = require('../../../front');

module.exports = function updateConversation() {
  return (req, res, next) => front.get(req.frontConversationUrl)
    .then((frontResponse) => {
      const frontConversation = frontResponse.body;
      logger.debug('front.get response', { frontConversation }, req);
      // Check if the Front agent archived the conversation.
      if (frontConversation.status === 'archived') {
        logger.debug('support request resolved', {}, req);
        return req.conversation.supportResolved().then(() => next());
      }

      return next();
    })
    .catch(err => err);
};
