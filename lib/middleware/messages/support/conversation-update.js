'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function updateConversation() {
  return (req, res, next) => helpers.front.getConversationByUrl(req.frontConversationUrl)
    .then((frontRes) => {
      const frontConversation = frontRes.body;
      logger.debug('front.getConversationByUrl success', { status: frontConversation.status }, req);
      // If Front agent didn't archive the Front conversation, we don't need to update our
      // Gambit Conversation.
      if (!helpers.front.isConversationArchived(frontConversation)) {
        return next();
      }

      // TODO: We should update Northstar User's sms_status here, setting it to false.
      // It currently won't get updated until User sends another inbound message back to Gambit.
      return req.conversation.setDefaultTopic()
        .then(() => next());
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
