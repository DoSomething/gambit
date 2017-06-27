'use strict';

const gambit = require('../gambit');

module.exports = function getCampaignReply() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    return gambit.getGambitReply(req.userId, req.body.text, req.keyword)
      .then((gambitReplyText) => {
        req.reply.type = 'gambit';
        req.reply.text = gambitReplyText;

        return next();
      })
      .catch(err => console.log(err));
  };
};
