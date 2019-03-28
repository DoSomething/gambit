'use strict';

const helpers = require('../../../helpers');

module.exports = function updateConversation() {
  return (req, res, next) => helpers.request.updateTopicIfChanged(req, req.topic)
    .then(() => next())
    .catch(err => helpers.sendErrorResponse(res, err));
};
