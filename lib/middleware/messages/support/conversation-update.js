'use strict';

const logger = require('../../../logger');
const front = require('../../../front');

module.exports = function updateConversation() {
  return (req, res, next) => front.get(req.frontConversationUrl)
    .then((frontResponse) => {
      const frontConversation = frontResponse.body;
      logger.debug('front.getConversation response', { status: frontConversation.status }, req);
      // Check if the Front agent archived the conversation.
      if (frontConversation.status === 'archived') {
        logger.debug('support request resolved', {}, req);
        // TODO: We should update Northstar User's sms_status here, setting it to false.
        // It currently won't get updated until User sends another inbound message back to Gambit.
        return req.conversation.setDefaultTopic().then(() => next());
      }

      return next();
    })
    .catch(err => err);
};
