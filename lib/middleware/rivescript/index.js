'use strict';

const helpers = require('../../helpers');
const logger = require('../../logger');
const graphql = require('../../graphql');

module.exports = function getRivescript() {
  return async (req, res) => {
    try {
      const resetCache = req.query.cache === 'false';

      if (resetCache === true || !helpers.rivescript.isBotReady()) {
        await helpers.rivescript.loadBot(resetCache);
      } else {
        const isCurrent = helpers.rivescript.isRivescriptCurrent();

        if (!isCurrent) {
          await helpers.rivescript.loadBot();
        }
      }

      const dynamicTriggers = await graphql.fetchConversationTriggers();

      console.log(dynamicTriggers);

      const data = helpers.rivescript.getDeparsedRivescript();

      logger.debug('data.topics.random', { count: data.topics.random.length });

      Object.keys(data.topics).forEach((rivescriptTopicName) => {
        data.topics[rivescriptTopicName].forEach((rivescriptTopicTrigger, index) => {
           const replyText = rivescriptTopicTrigger.reply[0];
           const macro = helpers.macro.getMacro(replyText);

           const current = data.topics[rivescriptTopicName][index];

           current.reply = macro ? [macro.text] : [replyText];
           current.macroName = macro ? macro.name : null;

           const dynamicTrigger = dynamicTriggers.find(item => item.trigger === current.trigger);

           current.hardcoded = !dynamicTrigger;
        });
      });

      return res.send({ data });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
