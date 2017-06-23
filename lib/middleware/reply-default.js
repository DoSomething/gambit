'use strict';

module.exports = function replyDefault() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }
    // If we haven't determined a reply.type by this point, who knows.
    req.reply.type = 'invalid';
    req.reply.text = 'Sorry, I didn\'t get that. Ask me a question, or try saying "michael"';

    return next();
  };
};
