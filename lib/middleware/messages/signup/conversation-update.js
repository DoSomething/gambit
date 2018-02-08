'use strict';

const helpers = require('../../../helpers');

module.exports = function updateConversation() {
  return (req, res, next) => req.conversation.setCampaign(req.campaign)
    .then(() => next())
    .catch(err => helpers.sendErrorResponse(res, err));
};
