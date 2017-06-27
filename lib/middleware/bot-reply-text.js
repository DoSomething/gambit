'use strict';

module.exports = function renderReplyText() {
  return (req, res, next) => {
    if (req.reply.text) {
      return next();
    }

    if (req.user.paused) {
      return next();
    }

    const campaign = req.campaign;
    req.reply.text = campaign.getMessageForMessageType(req.reply.type);

    return next();
  };
};
