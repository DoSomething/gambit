'use strict';

const logger = require('heroku-logger');
const front = require('../../front');

module.exports = function replyNoReply() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    if (req.user.paused) {
      req.reply.template = 'noReply';
      req.reply.text = '';

      return front.postMessage(req.user.id, req.body.text)
        .then((frontRes) => {
          logger.debug('front.postMessage', frontRes);

          return next();
        })
        .catch(err => console.log(err));
    }

    return next();
  };
};
