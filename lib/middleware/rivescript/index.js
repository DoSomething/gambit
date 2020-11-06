'use strict';

const lodash = require('lodash');

const graphql = require('../../graphql');
const helpers = require('../../helpers');

module.exports = function getRivescript() {
  return async (req, res) => {
    try {
      const resetCache = req.query.cache === 'false';

      if (resetCache === true || !helpers.rivescript.isBotReady()) {
        await helpers.rivescript.loadBot(resetCache);
      } else if (!helpers.rivescript.isRivescriptCurrent()) {
        await helpers.rivescript.loadBot();
      }

      const dynamicTriggers = await graphql.fetchConversationTriggers();

      const data = helpers.rivescript.getDeparsedRivescript();

      Object.keys(data.topics).forEach((rivescriptTopicName) => {
        data.topics[rivescriptTopicName].forEach((rivescriptTopicTrigger) => {
          const replyText = rivescriptTopicTrigger.reply[0];
          const macro = helpers.macro.getMacro(replyText);
          const dynamicTrigger = dynamicTriggers
            .find(item => item.trigger === rivescriptTopicTrigger.trigger);

          lodash.assignIn(rivescriptTopicTrigger, {
            reply: macro ? [macro.text] : [replyText],
            macro: macro ? macro.name : null,
            contentfulId: dynamicTrigger ? dynamicTrigger.id : null,
          });
        });
      });

      return res.send({ data });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
