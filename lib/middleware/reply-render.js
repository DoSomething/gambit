'use strict';

module.exports = function renderReplyText() {
  return (req, res, next) => {
    if (req.reply.text) {
      return next();
    }

    if (req.campaign) {
      req.reply.text = req.campaign[req.reply.template];

      return next();
    }

    req.reply.text = 'Eek, something went wrong. Try saying MENU.';
    return next();
  };
};
