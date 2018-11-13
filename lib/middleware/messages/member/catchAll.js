'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function catchAllMacro() {
  // Doesn't seem possible to get here, but if so:
  return async (req, res) => {
    logger.debug('catchAll could not find a match', {}, req);
    return helpers.replies.noCampaign(req, res);
  };
};
