'use strict';

const bot = require('../bot');
const helpers = require('../helpers');

module.exports = function replyBrain() {
  return (req, res, next) => {
    if (helpers.isMacro(req.reply.brain)) {
      return next();
    }

    req.reply.type = 'brain';
    req.reply.text = req.reply.brain;

    const topic = bot.getTopicForUserId(req.userId);
    console.log(`topic=${topic}`);

    return req.user.updateUserTopic(topic)
      .then((user) => {
        console.log(user);
        return next();
      })
      .catch(err => err);
  };
};
