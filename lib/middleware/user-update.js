'use strict';

module.exports = function updateUser() {
  return (req, res, next) => {
    req.user.lastReplyType = req.reply.template;
    req.user.save().then(() => next());
  };
};
