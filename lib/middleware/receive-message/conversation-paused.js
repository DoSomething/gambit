'use strict';

const logger = require('heroku-logger');
const front = require('../../front');

module.exports = function replyNoReply() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    if (req.conversation.paused) {
      req.reply.template = 'noReply';
      req.reply.text = '';

      return front.postMessage(req.platformUserId, req.inboundMessage.text)
        .then((frontRes) => {
          logger.debug('front.postMessage', frontRes);

          return next();
        })
        .catch((/* err */) => {
          // TODO console.log has to be replaced by other development logging library: Winston?
          // console.log(err);
        });
    }

    return next();
  };
};
