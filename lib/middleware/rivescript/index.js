'use strict';

const helpers = require('../../helpers');
const logger = require('../../logger');

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
      const data = helpers.rivescript.getDeparsedRivescript();
      logger.debug('data.topics.random', { count: data.topics.random.length });
      return res.send({ data });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
