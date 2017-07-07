'use strict';

const gambit = require('../gambit');

module.exports = function gambitTemplate() {
  return (req, res, next) => {
    if (req.reply.template && req.reply.template !== 'gambit') {
      return next();
    }

    if (! req.campaign) {
      return next();
    }

    return gambit.getGambitReply(req.user._id, req.body.text, req.body.mediaUrl, req.keyword)
      .then((gambitReplyText) => {
        req.reply.template = 'gambit';
        req.reply.text = gambitReplyText;

        return next();
      })
      .catch(err => console.log(err));
  };
};
