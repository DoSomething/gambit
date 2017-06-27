'use strict';

module.exports = function updateUser() {
  return (req, res, next) => {
    req.user.lastReplyType = req.reply.type;
    req.user.save().then(() => next());
  };
};
