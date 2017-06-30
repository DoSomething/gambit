'use strict';

module.exports = function updateUser() {
  return (req, res, next) => {
    req.user.lastReplyTemplate = req.reply.template;
    req.user.save().then(() => next());
  };
};
